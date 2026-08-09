'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Phone, Mail, Github, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  // Phone/OTP state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Email/Password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
    // Email/password login not implemented yet — OTP is the primary method
    setError('ورود با ایمیل و رمز عبور به زودی فعال می‌شود. از شماره موبایل استفاده کنید.');
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    // Google OAuth requires client-side redirect flow
    // For now, show a message
    setError('Google OAuth به زودی فعال می‌شود.');
  };

  const handleGithubLogin = () => {
    setError('GitHub OAuth به زودی فعال می‌شود.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            بازگشت به صفحه اصلی
          </Link>
          <CardTitle className="text-2xl font-bold">ورود به DevJoo</CardTitle>
          <CardDescription>
            با شماره موبایل یا اکانت شبکه‌های اجتماعی وارد شوید
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <Tabs defaultValue="phone" dir="rtl">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phone">
                <Phone className="ml-2 h-4 w-4" />
                موبایل
              </TabsTrigger>
              <TabsTrigger value="email">
                <Mail className="ml-2 h-4 w-4" />
                ایمیل
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phone">
              {!otpSent ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-medium">
                      شماره موبایل
                    </label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="09123456789"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      dir="ltr"
                      className="text-left"
                      maxLength={11}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleSendOtp}
                    disabled={loading || phone.length !== 11}
                  >
                    {loading ? 'در حال ارسال...' : 'ارسال کد تایید'}
                  </Button>
                </div>
              ) : (
                <div className="mt-4 space-y-4">
                  <div>
                    <p className="mb-2 text-sm text-muted-foreground">
                      کد تایید به <span className="font-medium text-foreground" dir="ltr">{phone}</span> ارسال شد.
                    </p>
                    {devCode && (
                      <p className="mb-2 text-xs text-amber-600 dark:text-amber-400">
                        [محیط توسعه] کد: {devCode}
                      </p>
                    )}
                    <Input
                      type="text"
                      placeholder="کد ۵ رقمی"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      dir="ltr"
                      className="text-center text-lg tracking-widest"
                      maxLength={5}
                      autoFocus
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleVerifyOtp}
                    disabled={loading || otpCode.length !== 5}
                  >
                    {loading ? 'در حال بررسی...' : 'تایید و ورود'}
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-muted-foreground hover:text-primary"
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
              )}
            </TabsContent>

            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium">
                    ایمیل
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    dir="ltr"
                    className="text-left"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium">
                    رمز عبور
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="رمز عبور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? 'در حال ورود...' : 'ورود'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6">
            <Separator className="my-4" />
            <p className="mb-4 text-center text-sm text-muted-foreground">
              یا ورود با
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                className="gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
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
                Google
              </Button>
              <Button
                variant="outline"
                onClick={handleGithubLogin}
                className="gap-2"
              >
                <Github className="h-4 w-4" />
                GitHub
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
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
      className="w-full text-sm text-muted-foreground hover:text-primary disabled:opacity-50"
      onClick={handleResend}
      disabled={cooldown > 0 || loading}
    >
      {cooldown > 0
        ? `ارسال مجدد کد (${cooldown} ثانیه)`
        : 'ارسال مجدد کد تایید'}
    </button>
  );
}
