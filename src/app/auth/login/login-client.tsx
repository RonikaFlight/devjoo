'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Github, Smartphone, Mail, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const oauthError = searchParams.get('error');

  // Phone/OTP state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'phone' | 'email'>('phone');

  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Initialize error from URL params
  useEffect(() => {
    if (oauthError === 'oauth_not_configured') {
      setError('OAuth تنظیم نشده است. لطفاً با شماره موبایل وارد شوید.');
    }
  }, [oauthError]);

  const handleSendOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'خطا در ارسال کد.');
        return;
      }
      setOtpSent(true);
      if (data.data?.devCode) {
        setDevCode(data.data.devCode);
      }
    } catch {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'کد نامعتبر است.');
        return;
      }
      if (data.data?.needsOnboarding) {
        router.push('/auth/role-select');
      } else {
        router.push(redirect);
      }
    } catch {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setError('ورود با ایمیل و رمز عبور به زودی فعال می‌شود. از شماره موبایل استفاده کنید.');
    setLoading(false);
  };

  return (
    <div
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12"
      dir="rtl"
    >
      {/* Subtle background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl" />
      </div>

      <div className="w-full max-w-[420px]">
        {/* Back link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          بازگشت به صفحه اصلی
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-card">
          {/* Logo */}
          <Link href="/" className="mb-6 flex items-center justify-center">
            <span className="text-2xl font-extrabold tracking-tight text-text-primary">
              Dev
            </span>
            <span className="text-2xl font-extrabold tracking-tight text-primary">
              Joo
            </span>
          </Link>

          {/* Title & subtitle */}
          <div className="mb-8 text-center">
            <h1 className="text-xl font-bold text-text-primary mb-2">
              خوش برگشتی
            </h1>
            <p className="text-sm leading-relaxed text-text-secondary">
              با حساب خود وارد DevJoo شو و پروژه‌های مناسب مهارتت را دنبال کن.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-5 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            {/* Google Button */}
            <button
              type="button"
              onClick={() => {
                window.location.href = `/api/v1/auth/oauth/google?callbackUrl=${encodeURIComponent(redirect)}`;
              }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-all hover:bg-muted hover:border-border-strong active:scale-[0.98]"
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              ادامه با Google
            </button>

            {/* GitHub Button */}
            <button
              type="button"
              onClick={() => {
                window.location.href = `/api/v1/auth/oauth/github?callbackUrl=${encodeURIComponent(redirect)}`;
              }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-surface px-4 py-3 text-sm font-medium text-text-primary transition-all hover:bg-muted hover:border-border-strong active:scale-[0.98]"
            >
              <Github className="h-5 w-5 shrink-0" />
              ادامه با GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-3 text-text-muted">
                یا ورود با شماره موبایل
              </span>
            </div>
          </div>

          {/* Phone / Email Tabs */}
          <div className="mb-5">
            <div className="flex rounded-xl border border-border bg-muted/50 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('phone');
                  setError('');
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  activeTab === 'phone'
                    ? 'bg-surface text-text-primary shadow-card'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Smartphone className="h-4 w-4" />
                موبایل
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('email');
                  setError('');
                }}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  activeTab === 'email'
                    ? 'bg-surface text-text-primary shadow-card'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <Mail className="h-4 w-4" />
                ایمیل
              </button>
            </div>
          </div>

          {/* Phone Tab Content */}
          {activeTab === 'phone' && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-medium text-text-primary"
                    >
                      شماره موبایل
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="09123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                      className="text-left h-11 rounded-xl border-border focus-visible:ring-primary/20"
                      maxLength={11}
                    />
                  </div>
                  <Button
                    className="w-full h-11 rounded-xl font-medium"
                    onClick={handleSendOtp}
                    disabled={loading || phone.length !== 11}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'ارسال کد تایید'
                    )}
                  </Button>
                </>
              ) : (
                <>
                  <div>
                    <p className="mb-3 text-sm text-text-secondary">
                      کد تایید به{' '}
                      <span
                        className="font-medium text-text-primary"
                        dir="ltr"
                      >
                        {phone}
                      </span>{' '}
                      ارسال شد.
                    </p>
                    {devCode && (
                      <p className="mb-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-1.5 text-xs text-amber-700">
                        [محیط توسعه] کد: {devCode}
                      </p>
                    )}
                    <Input
                      type="text"
                      placeholder="کد ۵ رقمی"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      dir="ltr"
                      className="text-center text-lg tracking-widest h-11 rounded-xl border-border focus-visible:ring-primary/20"
                      maxLength={5}
                      autoFocus
                    />
                  </div>
                  <Button
                    className="w-full h-11 rounded-xl font-medium"
                    onClick={handleVerifyOtp}
                    disabled={loading || otpCode.length !== 5}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      'تایید و ورود'
                    )}
                  </Button>
                  <div className="flex flex-col items-center gap-2 pt-1">
                    <button
                      type="button"
                      className="text-sm text-text-muted hover:text-primary transition-colors"
                      onClick={() => {
                        setOtpSent(false);
                        setOtpCode('');
                        setDevCode(null);
                      }}
                    >
                      تغییر شماره موبایل
                    </button>
                    <ResendOtpButton phone={phone} />
                  </div>
                </>
              )}
            </div>
          )}

          {/* Email Tab Content */}
          {activeTab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  ایمیل
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  className="text-left h-11 rounded-xl border-border focus-visible:ring-primary/20"
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  رمز عبور
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="رمز عبور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border focus-visible:ring-primary/20"
                />
              </div>
              <Button
                className="w-full h-11 rounded-xl font-medium"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'ورود'
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Footer text */}
        <p className="mt-6 text-center text-xs text-text-muted">
          با ورود به DevJoo،{' '}
          <Link
            href="/terms"
            className="text-text-secondary hover:text-primary underline-offset-2 hover:underline transition-colors"
          >
            قوانین و مقررات
          </Link>{' '}
          ما را می‌پذیرید.
        </p>
      </div>
    </div>
  );
}

function ResendOtpButton({ phone }: { phone: string }) {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/v1/auth/otp/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error?.message || 'خطا در ارسال مجدد کد.');
        return;
      }
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      alert('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className="text-sm text-text-muted hover:text-primary transition-colors disabled:opacity-50"
      onClick={handleResend}
      disabled={cooldown > 0 || loading}
    >
      {cooldown > 0
        ? `ارسال مجدد کد (${cooldown} ثانیه)`
        : 'ارسال مجدد کد تایید'}
    </button>
  );
}
