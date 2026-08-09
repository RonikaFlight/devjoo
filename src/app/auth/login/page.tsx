import { LoginClient } from './login-client';
import { generatePrivatePageMetadata } from '@/lib/seo/metadata';
import type { Metadata } from 'next';

export const metadata: Metadata = generatePrivatePageMetadata({
  title: 'ورود به حساب کاربری',
  description: 'وارد حساب کاربری DevJoo شوید.',
});

export default function LoginPage() {
  return <LoginClient />;
}
