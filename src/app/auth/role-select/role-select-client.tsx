'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Briefcase, Code2, Check } from 'lucide-react';
import Link from 'next/link';

export function RoleSelectClient() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'FREELANCER' | 'EMPLOYER' | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!displayName.trim() || !role) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim(), role }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error?.message || 'خطا در ثبت‌نام.');
        return;
      }

      if (role === 'FREELANCER') {
        router.push('/dashboard/freelancer');
      } else {
        router.push('/dashboard/employer');
      }
    } catch {
      setError('خطا در ارتباط با سرور.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" />
            بازگشت
          </Link>
          <CardTitle className="text-2xl font-bold">به DevJoo خوش آمدید!</CardTitle>
          <CardDescription>
            برای شروع، نام خود را وارد کنید و نقشتان را انتخاب کنید.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="mb-2 block text-sm font-medium">
                نام و نام خانوادگی
              </label>
              <Input
                id="displayName"
                placeholder="مثلاً: علی محمدی"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
              />
            </div>

            {/* Role Selection */}
            <div>
              <p className="mb-3 text-sm font-medium">شما چه نقشی دارید؟</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('FREELANCER')}
                  className={`relative rounded-xl border-2 p-5 text-center transition-all hover:border-primary/50 ${
                    role === 'FREELANCER'
                      ? 'border-primary bg-primary-soft dark:bg-primary/10'
                      : 'border-border'
                  }`}
                >
                  {role === 'FREELANCER' && (
                    <div className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <Code2 className="mx-auto mb-3 h-8 w-8 text-primary" />
                  <p className="font-semibold">فریلنسر</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    پروژه بگیر و انجام بده
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('EMPLOYER')}
                  className={`relative rounded-xl border-2 p-5 text-center transition-all hover:border-primary/50 ${
                    role === 'EMPLOYER'
                      ? 'border-primary bg-primary-soft dark:bg-primary/10'
                      : 'border-border'
                  }`}
                >
                  {role === 'EMPLOYER' && (
                    <div className="absolute top-2 left-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <Briefcase className="mx-auto mb-3 h-8 w-8 text-primary" />
                  <p className="font-semibold">کارفرما</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    پروژه بده و متخصص استخدام کن
                  </p>
                </button>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handleSubmit}
              disabled={loading || !displayName.trim() || !role}
            >
              {loading ? 'در حال ثبت‌نام...' : 'شروع کنید'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
