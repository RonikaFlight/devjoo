'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

interface CallbackState {
  callbackUrl: string;
  provider: string;
}

function getInitialError(searchParams: URLSearchParams): string | null {
  const error = searchParams.get('error');
  if (error) return 'احراز هویت لغو شد یا خطایی رخ داد.';
  if (!searchParams.get('code')) return 'کد احراز هویت دریافت نشد.';
  return null;
}

export function OAuthCallbackClient({ provider }: { provider: 'google' | 'github' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialError = getInitialError(searchParams);
  const [asyncError, setAsyncError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current || initialError) return;
    hasStarted.current = true;

    const code = searchParams.get('code');
    const stateParam = searchParams.get('state');

    // Decode state to get callbackUrl (base64url safe decode for browser)
    let callbackUrl = '/dashboard';
    if (stateParam) {
      try {
        const base64 = stateParam.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        const decoded = atob(padded);
        const stateJson = JSON.parse(decoded) as CallbackState;
        callbackUrl = stateJson.callbackUrl || '/dashboard';
      } catch {
        // Use default
      }
    }

    // Exchange code for session
    const redirectUri = `${window.location.origin}/auth/callback/${provider}`;

    fetch(`/api/v1/auth/oauth/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, redirectUri }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setAsyncError(data.error?.message || 'خطا در احراز هویت.');
          return;
        }
        if (data.data?.needsOnboarding) {
          router.push('/auth/role-select');
        } else {
          router.push(callbackUrl);
        }
      })
      .catch(() => {
        setAsyncError('خطا در ارتباط با سرور.');
      });
  }, [searchParams, provider, router, initialError]);

  const errorMessage = initialError || asyncError;

  if (errorMessage) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
        <div className="w-full max-w-sm text-center">
          <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-full bg-red-50 text-red-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-text-primary mb-2">خطا در ورود</h2>
          <p className="text-sm text-text-secondary mb-6">{errorMessage}</p>
          <a
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary-dark transition-colors"
          >
            بازگشت به ورود
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4" dir="rtl">
      <div className="w-full max-w-sm text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-text-secondary">
          در حال تایید حساب {provider === 'google' ? 'Google' : 'GitHub'}...
        </p>
      </div>
    </div>
  );
}
