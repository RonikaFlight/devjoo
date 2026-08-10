import { ProjectCreateClient } from './project-create-client';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'ثبت پروژه جدید',
  description: 'پروژه جدیدی ایجاد کنید و از فریلنسرهای حرفه‌ای پیشنهاد دریافت کنید.',
});

export default function NewProjectPage() {
  return <ProjectCreateClient />;
}
