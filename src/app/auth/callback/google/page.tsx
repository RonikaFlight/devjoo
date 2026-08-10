import { Suspense } from 'react';
import { OAuthCallbackClient } from '../oauth-callback-client';

export const metadata = {
  title: 'تایید حساب Google',
  robots: { index: false, follow: false },
};

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <OAuthCallbackClient provider="google" />
    </Suspense>
  );
}
