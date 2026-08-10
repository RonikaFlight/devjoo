import type { Metadata } from 'next';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  Eye,
  Award,
  ShieldCheck,
  Users,
  Briefcase,
  TrendingUp,
  ArrowLeft,
  Target,
} from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'درباره ما',
  description:
    'DevJoo بازار هوشمند پروژه‌های تکنولوژی و دیجیتال است. با مأموریت ایجاد بستری شفاف و حرفه‌ای برای اتصال فریلنسرها و کارفرماها.',
  path: '/about',
});

const values = [
  {
    icon: Lightbulb,
    title: 'هوشمندی',
    description:
      'سیستم‌های هوشمند ما، پروژه‌ها را با مهارت‌های فریلنسرها تطبیق می‌دهند تا بهترین نتیجه حاصل شود.',
  },
  {
    icon: Eye,
    title: 'شفافیت',
    description:
      'از قیمت‌گذاری تا مراحل پیشرفت پروژه، همه‌چیز شفاف و قابل ردیابی است.',
  },
  {
    icon: Award,
    title: 'کیفیت',
    description:
      'ما با تأکید بر نمونه‌کارها، ارزیابی‌ها و سیستم تأیید صلاحیت، کیفیت بالای خروجی را تضمین می‌کنیم.',
  },
  {
    icon: ShieldCheck,
    title: 'اعتماد',
    description:
      'با سیستم پرداخت امانی، قراردادهای هوشمند و پشتیبانی اختصاصی، خیال شما از هر جهت آسوده است.',
  },
];

const stats = [
  { icon: Users, value: '۵۰۰+', label: 'فریلنسر فعال' },
  { icon: Briefcase, value: '۱,۲۰۰+', label: 'پروژه ثبت‌شده' },
  { icon: TrendingUp, value: '۹۸٪', label: 'رضایت کارفرماها' },
  { icon: Target, value: '۷۰+', label: 'تخصص مختلف' },
];

export default function AboutPage() {
  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'درباره ما' },
            ]}
          />
        </div>

        {/* Hero Section */}
        <section className="mb-16">
          <div className="brand-gradient rounded-2xl p-8 sm:p-12 text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
              درباره <span className="text-white/90">DevJoo</span>
            </h1>
            <p className="mx-auto max-w-2xl text-white/85 text-base sm:text-lg leading-relaxed">
              DevJoo بستری هوشمند برای اتصال فریلنسرهای حرفه‌ای ایرانی به پروژه‌های تکنولوژی و دیجیتال است.
              ما باور داریم هر پروژه شایسته بهترین متخصص خودش را دارد.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-4">
              مأموریت ما
            </h2>
            <p className="text-text-secondary leading-relaxed text-base sm:text-lg">
              مأموریت DevJoo، ایجاد هوشمندانه‌ترین بازارچه پروژه‌های فنی و دیجیتال فارسی‌زبان است.
              ما می‌خواهیم فاصله بین کارفرمایانی که پروژه‌های ارزشمند دارند و متخصصانی که آماده
              خلق نتایج استاندارد هستند، به صفر برسانیم. با استفاده از الگوریتم‌های تطبیق هوشمند،
              فرایند استخدام فریلنسر را از ماه‌ها به چند روز و از تردید به اطمینان تبدیل می‌کنیم.
            </p>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 text-center">
            ارزش‌های ما
          </h2>
          <p className="text-text-secondary text-center mb-8 max-w-xl mx-auto">
            چهار اصل راهنمای ماست که هر تصمیمی در DevJoo بر پایه آن‌ها گرفته می‌شود.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card-base p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-2">{v.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Section */}
        <section className="mb-16">
          <div className="rounded-2xl bg-surface border border-border p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-text-primary mb-8 text-center">
              DevJoo در یک نگاه
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label} className="text-center">
                    <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">{s.value}</p>
                    <p className="text-sm text-text-secondary">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 text-center">
            تیم ما
          </h2>
          <p className="text-text-secondary text-center mb-8 max-w-xl mx-auto">
            تیم DevJoo از متخصصان باتجربه حوزه‌های تکنولوژی، محصول و طراحی تشکیل شده است.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {['محمد احمدی — مدیرعامل و بنیان‌گذار', 'سارا رضایی — مدیر محصول', 'علی موسوی — مهندس ارشد فنی'].map(
              (name) => (
                <div key={name} className="card-base p-6 text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft">
                    <Users className="h-10 w-10 text-primary/50" />
                  </div>
                  <p className="text-sm font-semibold text-text-primary">{name}</p>
                </div>
              ),
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="rounded-2xl bg-primary p-8 sm:p-10 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
            آماده‌اید به جامعه DevJoo بپیوندید؟
          </h2>
          <p className="mx-auto max-w-lg text-white/80 mb-6">
            چه فریلنسر باشید چه کارفرما، DevJoo بهترین بستر برای رشد شماست.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/register">
                ثبت‌نام رایگان
                <ArrowLeft className="mr-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-white hover:bg-white/10" asChild>
              <Link href="/projects">مشاهده پروژه‌ها</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  );
}
