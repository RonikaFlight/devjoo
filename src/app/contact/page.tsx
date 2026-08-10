import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { ContactFormClient } from './components/contact-form-client';
import { Mail, MessageSquare, Clock, MapPin } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'تماس با ما',
  description:
    'با تیم DevJoo در تماس باشید. سؤالات، پیشنهادات و مشکلات خود را از طریق فرم تماس یا ایمیل ارسال کنید.',
  path: '/contact',
});

const contactChannels = [
  {
    icon: Mail,
    title: 'ایمیل',
    value: 'info@devjoo.ir',
    href: 'mailto:info@devjoo.ir',
    dir: 'ltr' as const,
  },
  {
    icon: MessageSquare,
    title: 'شبکه‌های اجتماعی',
    value: '@devjoo_ir',
    href: 'https://twitter.com/devjoo_ir',
    dir: 'ltr' as const,
  },
  {
    icon: Clock,
    title: 'ساعات پاسخگویی',
    value: 'شنبه تا پنج‌شنبه، ۹ تا ۱۸',
    dir: 'rtl' as const,
  },
  {
    icon: MapPin,
    title: 'موقعیت',
    value: 'ایران',
    dir: 'rtl' as const,
  },
];

export default function ContactPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'تماس با ما' },
            ]}
          />
        </div>

        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
            تماس با ما
          </h1>
          <p className="mx-auto max-w-xl text-text-secondary leading-relaxed">
            سؤال، پیشنهاد یا مشکلی دارید؟ خوشحال می‌شویم صدای شما را بشنویم.
            تیم پشتیبانی DevJoo آماده پاسخگویی است.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {contactChannels.map((ch) => {
              const Icon = ch.icon;
              return (
                <div key={ch.title} className="card-base p-5 flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary mb-1">{ch.title}</p>
                    {ch.href ? (
                      <a
                        href={ch.href}
                        dir={ch.dir}
                        className="text-sm text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {ch.value}
                      </a>
                    ) : (
                      <p className="text-sm text-text-secondary" dir={ch.dir}>{ch.value}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="card-base p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary mb-6">ارسال پیام</h2>
              <ContactFormClient />
            </div>
          </div>
        </div>

        {/* Decorative Map Placeholder */}
        <div className="mt-12 rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-center h-48 sm:h-64 bg-primary-soft/50">
            <div className="text-center">
              <MapPin className="h-10 w-10 text-primary/40 mx-auto mb-3" />
              <p className="text-sm text-text-secondary">DevJoo — ایران</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
