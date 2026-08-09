import { db } from '@/lib/db';
import type { NotificationFiltersInput, NotificationMarkReadInput, NotificationPreferenceInput } from '@/lib/validators/notification';

/**
 * Create a notification for a user.
 */
export async function createNotification(data: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  dataJson?: Record<string, unknown>;
}) {
  // Check if user has this notification type enabled for IN_APP
  const pref = await db.notificationPreference.findUnique({
    where: {
      userId_type_channel: {
        userId: data.userId,
        type: data.type,
        channel: 'IN_APP',
      },
    },
  });

  // If preference exists and is disabled, skip
  if (pref && !pref.enabled) return;

  const notification = await db.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      body: data.body || null,
      data: data.dataJson ? JSON.stringify(data.dataJson) : null,
    },
  });

  return notification;
}

/**
 * Create notifications for multiple users (batch).
 */
export async function createNotificationsBatch(
  items: Array<{
    userId: string;
    type: string;
    title: string;
    body?: string;
    dataJson?: Record<string, unknown>;
  }>
) {
  if (items.length === 0) return;

  await db.notification.createMany({
    data: items.map((item) => ({
      userId: item.userId,
      type: item.type,
      title: item.title,
      body: item.body || null,
      data: item.dataJson ? JSON.stringify(item.dataJson) : null,
    })),
  });
}

/**
 * List notifications for a user with pagination.
 */
export async function listNotifications(userId: string, filters: NotificationFiltersInput) {
  const { isRead, type, page, limit } = filters;

  const where: Record<string, unknown> = { userId };
  if (isRead !== undefined) where.isRead = isRead;
  if (type) where.type = type;

  const [notifications, total] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        type: true,
        title: true,
        body: true,
        data: true,
        isRead: true,
        createdAt: true,
      },
    }),
    db.notification.count({ where }),
  ]);

  // Parse data JSON
  const parsed = notifications.map((n) => ({
    ...n,
    data: n.data ? JSON.parse(n.data) : null,
  }));

  return {
    notifications: parsed,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

/**
 * Mark notifications as read.
 */
export async function markNotificationsRead(userId: string, data: NotificationMarkReadInput) {
  if (data.markAll) {
    await db.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { marked: true, count: undefined };
  }

  if (data.notificationIds && data.notificationIds.length > 0) {
    const result = await db.notification.updateMany({
      where: {
        id: { in: data.notificationIds },
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });
    return { marked: true, count: result.count };
  }

  return { error: 'NO_INPUT' as const, message: 'حداقل یک شناسه اعلان یا markAll=true ارسال کنید.' };
}

/**
 * Get unread notification count.
 */
export async function getUnreadNotificationCount(userId: string) {
  const count = await db.notification.count({
    where: { userId, isRead: false },
  });
  return { count };
}

/**
 * Get notification preferences for a user.
 */
export async function getNotificationPreferences(userId: string) {
  const prefs = await db.notificationPreference.findMany({
    where: { userId },
  });
  return { preferences: prefs };
}

/**
 * Set default notification preferences for a user.
 * Called once during onboarding.
 */
export async function initializeDefaultPreferences(userId: string) {
  const types = [
    'PROJECT_PUBLISHED',
    'PROPOSAL_RECEIVED',
    'PROPOSAL_STATUS_CHANGED',
    'INVITATION_RECEIVED',
    'INVITATION_RESPONDED',
    'REVIEW_RECEIVED',
    'VERIFICATION_STATUS_CHANGED',
    'MESSAGE_RECEIVED',
    'PROJECT_STATUS_CHANGED',
  ];

  const channels = ['IN_APP', 'EMAIL', 'SMS', 'PUSH'];

  const data = [];
  for (const type of types) {
    for (const channel of channels) {
      // Enable IN_APP by default, others disabled
      data.push({
        userId,
        type,
        channel,
        enabled: channel === 'IN_APP',
      });
    }
  }

  await db.notificationPreference.createMany({
    data,
    skipDuplicates: true,
  });
}

/**
 * Update notification preferences (batch upsert).
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPreferenceInput[]
) {
  const results = [];

  for (const pref of preferences) {
    const updated = await db.notificationPreference.upsert({
      where: {
        userId_type_channel: {
          userId,
          type: pref.type,
          channel: pref.channel,
        },
      },
      create: {
        userId,
        type: pref.type,
        channel: pref.channel,
        enabled: pref.enabled,
      },
      update: {
        enabled: pref.enabled,
      },
    });
    results.push(updated);
  }

  return { preferences: results };
}
