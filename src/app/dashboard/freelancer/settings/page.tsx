'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Settings, Bell, Shield, Globe } from 'lucide-react';

const notificationSettings = [
  {
    id: 'proposal_status',
    label: 'وضعیت پیشنهاد',
    description: 'وقتی وضعیت پیشنهادهای شما تغییر کند',
    defaultChecked: true,
  },
  {
    id: 'new_invitation',
    label: 'دعوت‌نامه جدید',
    description: 'وقتی کارفرمایی شما را به پروژه‌اش دعوت کند',
    defaultChecked: true,
  },
  {
    id: 'message_received',
    label: 'پیام جدید',
    description: 'وقتی پیام جدیدی در گفتگوها دریافت کنید',
    defaultChecked: true,
  },
  {
    id: 'project_match',
    label: 'پروژه‌های مشابه',
    description: 'وقتی پروژه‌ای مرتبط با تخصص شما ثبت شود',
    defaultChecked: false,
  },
];

export default function FreelancerSettingsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/freelancer">داشبورد</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>تنظیمات</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">تنظیمات</h1>
        <p className="mt-1 text-text-secondary">
          مدیریت تنظیمات حساب و اعلان‌ها
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings nav */}
        <div className="space-y-1 lg:col-span-1">
          {[
            { icon: Bell, label: 'اعلان‌ها', active: true },
            { icon: Shield, label: 'امنیت' },
            { icon: Globe, label: 'زبان و منطقه' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.active
                    ? 'bg-primary-soft text-primary'
                    : 'text-text-secondary hover:bg-muted hover:text-text-primary'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Settings content */}
        <Card className="card-base border-0 lg:col-span-2">
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="flex items-center gap-2 font-semibold text-text-primary">
                <Bell className="h-5 w-5" />
                تنظیمات اعلان‌ها
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                تعیین کنید چه اعلان‌هایی دریافت کنید
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              {notificationSettings.map((setting) => (
                <div
                  key={setting.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <Label className="text-text-primary">{setting.label}</Label>
                    <p className="mt-0.5 text-sm text-text-muted">
                      {setting.description}
                    </p>
                  </div>
                  <Switch defaultChecked={setting.defaultChecked} />
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-end">
              <Button>ذخیره تنظیمات</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Placeholder note */}
      <div className="rounded-xl border border-dashed border-border p-6 text-center">
        <Settings className="mx-auto mb-2 h-10 w-10 text-text-muted" />
        <p className="text-sm text-text-secondary">
          تنظیمات بیشتر به زودی اضافه خواهند شد.
        </p>
      </div>
    </div>
  );
}
