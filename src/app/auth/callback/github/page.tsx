import { Suspense } from 'react';
import { OAuthCallbackClient } from '../oauth-callback-client';

export const metadata = {
  title: 'تایید حساب GitHub',
  robots: { index: false, follow: false },
};

export default function GithubCallbackPage() {
  return (
    <Suspense>
      <OAuthCallbackClient provider="github" />
    </Suspense>
  );
}
