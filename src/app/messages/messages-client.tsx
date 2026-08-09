'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { formatNumber } from '@/lib/utils/currency';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Send,
  Plus,
  ArrowRight,
  Search,
  MessageCircle,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Participant {
  id: string;
  displayName: string;
  profile: { avatarUrl: string } | null;
}

interface LastMessage {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  senderId: string;
}

interface Conversation {
  id: string;
  type: 'DIRECT' | 'PROJECT';
  createdAt: string;
  updatedAt: string;
  participants: Participant[];
  lastMessage: LastMessage | null;
  unreadCount: number;
}

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'SYSTEM' | 'FILE';
  senderId: string;
  createdAt: string;
  isRead: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);

  if (diffSec < 60) return 'همین الان';
  if (diffMin < 60) return formatNumber(diffMin) + ' دقیقه پیش';
  if (diffHour < 24) return formatNumber(diffHour) + ' ساعت پیش';
  if (diffDay < 7) return formatNumber(diffDay) + ' روز پیش';
  if (diffWeek < 4) return formatNumber(diffWeek) + ' هفته پیش';

  return new Intl.DateTimeFormat('fa-IR', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

function formatMessageTime(dateStr: string): string {
  return new Intl.DateTimeFormat('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr));
}

function getOtherParticipant(
  conversation: Conversation,
  currentUserId: string | undefined,
): Participant {
  const other = conversation.participants.find(
    (p) => p.id !== currentUserId,
  );
  return other || conversation.participants[0];
}

function truncate(str: string, len: number): string {
  if (str.length <= len) return str;
  return str.slice(0, len) + '…';
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MessagesClient() {
  const { user } = useAuth();

  /* ---- State ---- */
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(null);
  const [showChat, setShowChat] = useState(false); // mobile toggle

  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // New conversation dialog
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [newConvParticipantId, setNewConvParticipantId] = useState('');
  const [newConvProjectId, setNewConvProjectId] = useState('');
  const [creatingConv, setCreatingConv] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  /* ---- Fetch conversations ---- */
  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/conversations');
      if (res.ok) {
        const json = await res.json();
        setConversations(json.data || []);
      }
    } catch {
      // silent
    } finally {
      setConversationsLoading(false);
    }
  }, []);

  /* ---- Fetch messages ---- */
  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const res = await fetch(
        `/api/v1/conversations/${conversationId}/messages?page=1&limit=50`,
      );
      if (res.ok) {
        const json = await res.json();
        const fetchedMessages: Message[] = json.data || [];

        setMessages((prev) => {
          // Deduplicate: keep all unique messages sorted by time
          const map = new Map<string, Message>();
          for (const m of prev) map.set(m.id, m);
          for (const m of fetchedMessages) map.set(m.id, m);
          return Array.from(map.values()).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() -
              new Date(b.createdAt).getTime(),
          );
        });
      }
    } catch {
      // silent
    }
  }, []);

  /* ---- Open conversation ---- */
  const openConversation = useCallback(
    async (conversationId: string) => {
      setActiveConversationId(conversationId);
      setMessages([]);
      setMessagesLoading(true);
      setShowChat(true);

      await fetchMessages(conversationId);
      setMessagesLoading(false);
    },
    [fetchMessages],
  );

  /* ---- Send message ---- */
  const sendMessage = useCallback(async () => {
    if (!activeConversationId || !messageInput.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const res = await fetch(
        `/api/v1/conversations/${activeConversationId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: messageInput.trim(),
            type: 'TEXT',
          }),
        },
      );
      if (res.ok) {
        const json = await res.json();
        const newMsg: Message = json.data;
        setMessages((prev) => [...prev, newMsg]);
        setMessageInput('');

        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }

        // Update conversation's last message optimistically
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeConversationId
              ? {
                  ...c,
                  lastMessage: {
                    id: newMsg.id,
                    content: newMsg.content,
                    type: newMsg.type,
                    createdAt: newMsg.createdAt,
                    senderId: newMsg.senderId,
                  },
                  updatedAt: newMsg.createdAt,
                }
              : c,
          ),
        );
      } else {
        const json = await res.json().catch(() => null);
        toast.error(
          json?.error?.message || 'خطا در ارسال پیام',
        );
      }
    } catch {
      toast.error('خطا در ارسال پیام');
    } finally {
      setSendingMessage(false);
    }
  }, [activeConversationId, messageInput, sendingMessage]);

  /* ---- Create new conversation ---- */
  const createConversation = useCallback(async () => {
    if (!newConvParticipantId.trim() || creatingConv) return;

    setCreatingConv(true);
    try {
      const body: { participantId: string; projectId?: string } = {
        participantId: newConvParticipantId.trim(),
      };
      if (newConvProjectId.trim()) {
        body.projectId = newConvProjectId.trim();
      }

      const res = await fetch('/api/v1/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const json = await res.json();
        const conv: Conversation = json.data;
        setConversations((prev) => [conv, ...prev]);
        setNewConvOpen(false);
        setNewConvParticipantId('');
        setNewConvProjectId('');
        openConversation(conv.id);
        toast.success('مکالمه ایجاد شد');
      } else {
        const json = await res.json().catch(() => null);
        toast.error(
          json?.error?.message || 'خطا در ایجاد مکالمه',
        );
      }
    } catch {
      toast.error('خطا در ایجاد مکالمه');
    } finally {
      setCreatingConv(false);
    }
  }, [newConvParticipantId, newConvProjectId, creatingConv, openConversation]);

  /* ---- Polling: messages ---- */
  useEffect(() => {
    if (!activeConversationId) return;
    const interval = setInterval(() => {
      fetchMessages(activeConversationId);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeConversationId, fetchMessages]);

  /* ---- Polling: conversations (unread counts) ---- */
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  /* ---- Auto-scroll on new messages ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ---- Initial load ---- */
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  /* ---- Back to list on mobile ---- */
  const handleBackToList = useCallback(() => {
    setShowChat(false);
    // Don't clear activeConversationId so desktop keeps the chat open
  }, []);

  /* ---- Textarea auto-grow & keyboard handling ---- */
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      if (val.length > 2000) return;
      setMessageInput(val);

      // Auto-grow
      const ta = e.target;
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 120) + 'px';
    },
    [],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  /* ---- Filtered conversations ---- */
  const filteredConversations = searchQuery.trim()
    ? conversations.filter((c) => {
        const other = getOtherParticipant(c, user?.id);
        return other.displayName
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());
      })
    : conversations;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div className="mx-auto h-[calc(100vh-8rem)] max-w-6xl overflow-hidden rounded-xl border bg-surface shadow-sm">
      <div className="flex h-full">
        {/* ===================== LEFT PANEL ===================== */}
        <div
          className={cn(
            'flex h-full w-full flex-col md:w-80 md:border-e',
            showChat ? 'hidden md:flex' : 'flex',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h1 className="text-lg font-bold">پیام‌ها</h1>

            <Dialog open={newConvOpen} onOpenChange={setNewConvOpen}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="ml-1 h-4 w-4" />
                  مکالمه جدید
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>مکالمه جدید</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="participantId"
                      className="text-sm font-medium"
                    >
                      شناسه کاربر
                    </label>
                    <Input
                      id="participantId"
                      placeholder="شناسه کاربر مقابل را وارد کنید"
                      value={newConvParticipantId}
                      onChange={(e) => setNewConvParticipantId(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="projectId"
                      className="text-sm font-medium"
                    >
                      شناسه پروژه <span className="text-muted-foreground">(اختیاری)</span>
                    </label>
                    <Input
                      id="projectId"
                      placeholder="شناسه پروژه (در صورت وجود)"
                      value={newConvProjectId}
                      onChange={(e) => setNewConvProjectId(e.target.value)}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={createConversation}
                    disabled={!newConvParticipantId.trim() || creatingConv}
                  >
                    {creatingConv ? 'در حال ایجاد…' : 'ایجاد مکالمه'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Search */}
          <div className="border-b px-3 py-2">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="ps-9"
                placeholder="جستجو در مکالمه‌ها…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversation list */}
          <ScrollArea className="flex-1">
            {conversationsLoading ? (
              <div className="space-y-3 p-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-2 py-2">
                    <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <MessageCircle className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? 'مکالمه‌ای یافت نشد'
                    : 'هنوز مکالمه‌ای ندارید'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conv) => {
                  const other = getOtherParticipant(conv, user?.id);
                  const isActive = conv.id === activeConversationId;

                  return (
                    <button
                      key={conv.id}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/50',
                        isActive && 'border-s-2 border-primary bg-primary-soft/50',
                      )}
                      onClick={() => openConversation(conv.id)}
                    >
                      <Avatar className="h-10 w-10 shrink-0">
                        {other.profile?.avatarUrl ? (
                          <AvatarImage
                            src={other.profile.avatarUrl}
                            alt={other.displayName}
                          />
                        ) : null}
                        <AvatarFallback className="text-xs">
                          {getInitials(other.displayName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold">
                            {other.displayName}
                          </span>
                          {conv.lastMessage && (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {relativeTime(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-muted-foreground">
                            {conv.lastMessage
                              ? truncate(conv.lastMessage.content, 50)
                              : 'شروع گفتگو'}
                          </p>
                          {conv.unreadCount > 0 && (
                            <Badge className="shrink-0 h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs">
                              {formatNumber(conv.unreadCount)}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* ===================== RIGHT PANEL ==================== */}
        <div
          className={cn(
            'flex h-full flex-1 flex-col',
            !showChat ? 'hidden md:flex' : 'flex',
          )}
        >
          {activeConversation ? (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 border-b px-4 py-3">
                {/* Back button (mobile only) */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  onClick={handleBackToList}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <Avatar className="h-9 w-9 shrink-0">
                  {(() => {
                    const other = getOtherParticipant(
                      activeConversation,
                      user?.id,
                    );
                    return other.profile?.avatarUrl ? (
                      <AvatarImage
                        src={other.profile.avatarUrl}
                        alt={other.displayName}
                      />
                    ) : null;
                  })()}
                  <AvatarFallback className="text-xs">
                    {getInitials(
                      getOtherParticipant(activeConversation, user?.id)
                        .displayName,
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {getOtherParticipant(activeConversation, user?.id)
                      .displayName}
                  </p>
                  {activeConversation.type === 'PROJECT' && (
                    <p className="text-xs text-muted-foreground">
                      مکالمه پروژه‌ای
                    </p>
                  )}
                </div>
              </div>

              {/* Messages area */}
              <ScrollArea className="flex-1">
                <div className="space-y-3 p-4">
                  {messagesLoading ? (
                    <div className="flex flex-col items-center gap-3 py-8">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton
                          key={i}
                          className={cn(
                            'h-12 rounded-2xl',
                            i % 2 === 0
                              ? 'ms-auto w-3/5'
                              : 'me-auto w-2/5',
                          )}
                        />
                      ))}
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center py-16">
                      <p className="text-sm text-muted-foreground">
                        هنوز پیامی ارسال نشده. اولین پیام را بفرستید!
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMine = msg.senderId === user?.id;
                      const isSystem = msg.type === 'SYSTEM';

                      if (isSystem) {
                        return (
                          <div
                            key={msg.id}
                            className="flex justify-center"
                          >
                            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                              {msg.content}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            'flex flex-col',
                            isMine ? 'items-start' : 'items-end',
                          )}
                        >
                          {/* Sender name for PROJECT conversations */}
                          {activeConversation.type === 'PROJECT' &&
                            !isMine && (
                              <span className="mb-1 text-xs text-muted-foreground">
                                {(() => {
                                  const sender = activeConversation.participants.find(
                                    (p) => p.id === msg.senderId,
                                  );
                                  return sender?.displayName || '';
                                })()}
                              </span>
                            )}

                          <div
                            className={cn(
                              'rounded-2xl px-4 py-2 max-w-[75%]',
                              isMine
                                ? 'bg-primary text-white ms-auto'
                                : 'bg-muted text-foreground',
                            )}
                          >
                            <p className="whitespace-pre-wrap text-sm leading-7">
                              {msg.content}
                            </p>
                          </div>
                          <span
                            className={cn(
                              'mt-1 text-xs text-muted-foreground',
                              isMine ? 'ms-1' : 'me-1',
                            )}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </span>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message input */}
              <div className="border-t p-3">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={messageInput}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="پیام خود را بنویسید…"
                    rows={1}
                    className={cn(
                      'flex-1 resize-none rounded-xl border bg-background px-4 py-2.5 text-sm',
                      'focus:outline-none focus:ring-2 focus:ring-primary/30',
                      'max-h-[120px] placeholder:text-muted-foreground',
                    )}
                  />
                  <Button
                    size="icon"
                    className="h-10 w-10 shrink-0 rounded-xl"
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || sendingMessage}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {messageInput.length > 1800 && (
                  <p className="mt-1 text-xs text-muted-foreground text-start">
                    {formatNumber(2000 - messageInput.length)} کاراکتر باقی‌مانده
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Empty state when no conversation selected */
            <div className="flex h-full flex-col items-center justify-center px-4">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <MessageCircle className="h-10 w-10 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-lg font-semibold">پیام‌ها</h2>
              <p className="max-w-xs text-center text-sm text-muted-foreground">
                یک مکالمه را از لیست سمت راست انتخاب کنید یا مکالمه جدیدی بسازید.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
