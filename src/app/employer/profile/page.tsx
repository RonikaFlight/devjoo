'use client';

import { useAuth } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { UserCircle, Camera } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export default function EmployerProfilePage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/employer">داشبورد</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>پروفایل</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">پروفایل کارفرما</h1>
        <p className="mt-1 text-text-secondary">
          اطلاعات پروفایل خود را ویرایش کنید
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar section */}
        <Card className="card-base border-0 lg:col-span-1">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.profile?.avatarUrl || undefined} />
                <AvatarFallback className="bg-primary-soft text-xl font-bold text-primary">
                  {user?.displayName?.charAt(0) || 'ک'}
                </AvatarFallback>
              </Avatar>
              <button className="absolute -bottom-1 -start-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105">
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="font-semibold text-text-primary">
                {user?.displayName || 'کارفرما'}
              </p>
              {user?.profile?.headline && (
                <p className="mt-0.5 text-sm text-text-muted">{user.profile.headline}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Form section */}
        <Card className="card-base border-0 lg:col-span-2">
          <CardContent className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">نام نمایشی</Label>
                <Input
                  id="displayName"
                  defaultValue={user?.displayName || ''}
                  placeholder="نام شرکت یا شخصی شما"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="headline">عنوان</Label>
                <Input
                  id="headline"
                  defaultValue={user?.profile?.headline || ''}
                  placeholder="مثلا: استارتاپ فین‌تک"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">درباره ما</Label>
              <Textarea
                id="bio"
                rows={4}
                defaultValue={user?.profile?.bio || ''}
                placeholder="معرفی کوتاهی از شرکت یا تیم خود بنویسید..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">شهر</Label>
              <Input
                id="city"
                defaultValue={user?.profile?.city || ''}
                placeholder="مثلا: تهران"
              />
            </div>

            <div className="flex justify-end">
              <Button>ذخیره تغییرات</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Note */}
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <UserCircle className="mx-auto mb-2 h-10 w-10 text-text-muted" />
        <p className="text-sm text-text-secondary">
          پروفایل کامل‌تر باعث افزایش اعتماد فریلنسرها و دریافت پیشنهادهای بهتر می‌شود.
        </p>
      </div>
    </div>
  );
}
