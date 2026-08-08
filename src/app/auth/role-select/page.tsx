import { RoleSelectClient } from './role-select-client';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'انتخاب نقش',
  description: 'نقش خود را در DevJoo انتخاب کنید.',
});

export default function RoleSelectPage() {
  return <RoleSelectClient />;
}
