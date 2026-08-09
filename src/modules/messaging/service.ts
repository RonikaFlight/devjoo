import { db } from '@/lib/db';
import type { ConversationCreateInput, ConversationFiltersInput } from '@/lib/validators/conversation';
import type { MessageSendInput as MsgInput, MessageFiltersInput as MsgFilters } from '@/lib/validators/message';
import { dispatchMessageReceived } from '@/modules/notifications/dispatcher';

/**
 * Find or create a direct conversation between two users.
 */
export async function findOrCreateConversation(
  userId: string,
  data: ConversationCreateInput
) {
  const { participantId, projectId, type } = data;

  if (participantId === userId) {
    return { error: 'SELF_CONVERSATION' as const, message: 'نمی‌توانید با خودتان گفتگو کنید.' };
  }

  // Verify the other user exists
  const otherUser = await db.user.findUnique({
    where: { id: participantId },
    select: { id: true, isActive: true },
  });
  if (!otherUser) return { error: 'NOT_FOUND' as const, message: 'کاربر یافت نشد.' };
  if (!otherUser.isActive) return { error: 'USER_INACTIVE' as const, message: 'کاربر غیرفعال است.' };

  // If project-linked, verify project exists
  if (projectId) {
    const project = await db.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) return { error: 'PROJECT_NOT_FOUND' as const, message: 'پروژه یافت نشد.' };
  }

  const conversationType = type || (projectId ? 'PROJECT' : 'DIRECT');

  // Check for existing conversation between these two users (same type + project)
  const existingMembers = await db.conversationMember.findMany({
    where: { userId: { in: [userId, participantId] } },
    select: { conversationId: true, userId: true },
  });

  // Group by conversationId to find one where both are members
  const convMemberMap = new Map<string, string[]>();
  for (const m of existingMembers) {
    const existing = convMemberMap.get(m.conversationId) || [];
    existing.push(m.userId);
    convMemberMap.set(m.conversationId, existing);
  }

  let existingConvId: string | null = null;
  for (const [convId, members] of convMemberMap) {
    if (members.length === 2 && members.includes(userId) && members.includes(participantId)) {
      // Verify same type and projectId
      const conv = await db.conversation.findUnique({
        where: { id: convId },
        select: { type: true, projectId: true },
      });
      if (conv && conv.type === conversationType && conv.projectId === (projectId || null)) {
        existingConvId = convId;
        break;
      }
    }
  }

  if (existingConvId) {
    return await getConversationWithDetails(existingConvId, userId);
  }

  // Create new conversation
  const conversation = await db.conversation.create({
    data: {
      type: conversationType,
      projectId: projectId || null,
      members: {
        create: [
          { userId },
          { userId: participantId },
        ],
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } },
          },
        },
      },
      project: {
        select: { id: true, title: true, slug: true },
      },
    },
  });

  return { conversation };
}

/**
 * Get a single conversation with details (members, last message, unread count).
 */
async function getConversationWithDetails(conversationId: string, userId: string) {
  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    include: {
      members: {
        include: {
          user: {
            select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } },
          },
        },
      },
      project: {
        select: { id: true, title: true, slug: true },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  if (!conversation) return { error: 'NOT_FOUND' as const, message: 'گفتگو یافت نشد.' };

  // Check membership
  const isMember = conversation.members.some((m) => m.userId === userId);
  if (!isMember) return { error: 'FORBIDDEN' as const, message: 'شما عضو این گفتگو نیستید.' };

  // Get last message
  const lastMessage = await db.message.findFirst({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      type: true,
      createdAt: true,
      senderId: true,
    },
  });

  // Count unread messages
  const member = conversation.members.find((m) => m.userId === userId);
  const unreadCount = member?.lastReadAt
    ? await db.message.count({
        where: {
          conversationId,
          senderId: { not: userId },
          createdAt: { gt: member.lastReadAt },
        },
      })
    : await db.message.count({
        where: {
          conversationId,
          senderId: { not: userId },
        },
      });

  return {
    conversation: {
      ...conversation,
      lastMessage,
      unreadCount,
    },
  };
}

/**
 * List conversations for a user with unread counts and last message.
 */
export async function listConversations(userId: string, filters: ConversationFiltersInput) {
  const { page, limit } = filters;

  const memberRecords = await db.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true },
  });
  const conversationIds = memberRecords.map((m) => m.conversationId);

  if (conversationIds.length === 0) {
    return { conversations: [], meta: { page, limit, total: 0, totalPages: 0 } };
  }

  const [conversations, total] = await Promise.all([
    db.conversation.findMany({
      where: { id: { in: conversationIds } },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } },
            },
          },
        },
        project: {
          select: { id: true, title: true, slug: true },
        },
      },
    }),
    db.conversation.count({ where: { id: { in: conversationIds } } }),
  ]);

  // Batch-fetch last messages and unread counts
  const enriched = await Promise.all(
    conversations.map(async (conv) => {
      const lastMessage = await db.message.findFirst({
        where: { conversationId: conv.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          type: true,
          createdAt: true,
          senderId: true,
        },
      });

      const member = conv.members.find((m) => m.userId === userId);
      const unreadCount = member?.lastReadAt
        ? await db.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: userId },
              createdAt: { gt: member.lastReadAt },
            },
          })
        : await db.message.count({
            where: {
              conversationId: conv.id,
              senderId: { not: userId },
            },
          });

      return { ...conv, lastMessage, unreadCount };
    })
  );

  return {
    conversations: enriched,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Get a single conversation by ID.
 */
export async function getConversation(conversationId: string, userId: string) {
  return getConversationWithDetails(conversationId, userId);
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  data: MsgInput
) {
  // Verify membership
  const member = await db.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId: senderId } },
  });
  if (!member) return { error: 'FORBIDDEN' as const, message: 'شما عضو این گفتگو نیستید.' };

  const message = await db.message.create({
    data: {
      conversationId,
      senderId,
      content: data.content,
      type: data.type,
    },
    include: {
      sender: {
        select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } },
      },
    },
  });

  // Update conversation updatedAt
  await db.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  // Notify other members (non-blocking)
  if (data.type === 'TEXT') {
    dispatchMessageReceived(conversationId, senderId, message.id).catch(() => {});
  }

  return { message };
}

/**
 * List messages in a conversation.
 */
export async function listMessages(
  conversationId: string,
  userId: string,
  filters: MsgFilters
) {
  // Verify membership
  const member = await db.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!member) return { error: 'FORBIDDEN' as const, message: 'شما عضو این گفتگو نیستید.' };

  const { page, limit } = filters;

  const [messages, total] = await Promise.all([
    db.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: { id: true, displayName: true, profile: { select: { avatarUrl: true } } },
        },
      },
    }),
    db.message.count({ where: { conversationId } }),
  ]);

  // Mark messages as read (update lastReadAt)
  await db.conversationMember.update({
    where: { id: member.id },
    data: { lastReadAt: new Date() },
  });

  return {
    messages,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Get total unread message count for a user.
 */
export async function getUnreadMessageCount(userId: string) {
  const members = await db.conversationMember.findMany({
    where: { userId },
    select: { conversationId: true, lastReadAt: true },
  });

  let total = 0;
  for (const m of members) {
    const where: Record<string, unknown> = {
      conversationId: m.conversationId,
      senderId: { not: userId },
    };
    if (m.lastReadAt) {
      where.createdAt = { gt: m.lastReadAt };
    }
    total += await db.message.count({ where });
  }

  return { count: total };
}
