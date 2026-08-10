import { requireAuth } from '@/lib/auth';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';
import MessagesClient from './messages-client';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'پیام‌ها',
  description: 'پیام‌های شما در DevJoo',
});

export default async function MessagesPage() {
  await requireAuth();
  return <MessagesClient />;
}
