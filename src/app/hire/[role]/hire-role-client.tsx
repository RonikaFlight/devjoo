'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, Users, Zap, Shield } from 'lucide-react';

interface HireInfo {
  skillSlug: string;
  title: string;
  description: string;
}

interface SkillData {
  id: string;
  name: string;
  slug: string;
  category: { id: string; name: string; slug: string } | null;
  synonyms: string[];
}

interface RelatedSkill {
  id: string;
  name: string;
  slug: string;
}

interface OtherCategory {
  id: string;
  name: string;
  slug: string;
  skills: { name: string; slug: string }[];
}

/** Map skill slug → hire-role slug */
const skillToHireRole: Record<string, string> = {
  react: 'react-developer',
  nextjs: 'nextjs-developer',
  nodejs: 'nodejs-developer',
  python: 'python-developer',
  wordpress: 'wordpress-developer',
  laravel: 'laravel-developer',
  flutter: 'flutter-developer',
  javascript: 'javascript-developer',
  typescript: 'typescript-developer',
  'ui-design': 'ui-ux-designer',
  'ux-design': 'ui-ux-designer',
  figma: 'figma-designer',
  'adobe-photoshop': 'graphic-designer',
  'adobe-illustrator': 'graphic-designer',
  seo: 'seo-specialist',
  'react-native': 'mobile-developer',
};

export function HireRoleClient({
  role,
  hireInfo,
  skill,
  relatedSkills,
  otherCategories,
}: {
  role: string;
  hireInfo: HireInfo;
  skill: SkillData | null;
  relatedSkills: RelatedSkill[];
  otherCategories: OtherCategory[];
}) {
  const benefits = [
    {
      icon: Users,
      title: 'متخصصین تأییدشده',
      description: 'تمامی فریلنسرها احراز هویت شده‌اند.',
    },
    {
      icon: Zap,
      title: 'پاسخ سریع',
      description: 'میانگین پاسخ‌دهی زیر ۲۴ ساعت.',
    },
    {
      icon: Shield,
      title: 'پرداخت امن',
      description: 'پول شما تا رضایت کامل نگه‌داری می‌شود.',
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
          {hireInfo.title}
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          {hireInfo.description}
        </p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/projects/create">
              ثبت پروژه رایگان
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
          {skill && (
            <Button size="lg" variant="outline" asChild>
              <Link href={`/projects/skills/${skill.slug}`}>
                مشاهده پروژه‌های {skill.name}
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        {benefits.map((b) => (
          <Card key={b.title} className="border-border">
            <CardContent className="flex items-start gap-3 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">{b.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b.description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Skill Info */}
      {skill && (
        <div className="mb-10 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-3 text-lg font-semibold">درباره {skill.name}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {skill.category && (
              <>
                {skill.name} یکی از مهارت‌های کلیدی در حوزه{' '}
                <Link
                  href={`/projects/${skill.category.slug}`}
                  className="text-primary hover:underline"
                >
                  {skill.category.name}
                </Link>{' '}
                است. فریلنسرهای متخصص در این مهارت می‌توانند پروژه‌های متنوعی را
                با کیفیت بالا و در زمان مقرر تحویل دهند.
              </>
            )}
          </p>
          {skill.synonyms.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-xs text-muted-foreground">همچنین به عنوان:</span>
              {skill.synonyms.map((syn) => (
                <Badge key={syn} variant="outline" className="text-xs">
                  {syn}
                </Badge>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How it Works */}
      <div className="mb-10">
        <h2 className="mb-4 text-lg font-semibold">چگونه {hireInfo.title.replace('استخدام ', '')} استخدام کنیم؟</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: '۱',
              title: 'پروژه ثبت کنید',
              description: 'جزئیات پروژه، مهارت‌های مورد نیاز و بودجه را مشخص کنید.',
            },
            {
              step: '۲',
              title: 'پیشنهادها را بررسی کنید',
              description: 'فریلنسرها پیشنهاد خود را ارسال می‌کنند. نمونه کار و قیمت را مقایسه کنید.',
            },
            {
              step: '۳',
              title: 'بهترین را انتخاب کنید',
              description: 'متخصص مناسب را انتخاب و پروژه را شروع کنید.',
            },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 rounded-xl border border-border p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {item.step}
              </span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Skills */}
      {relatedSkills.length > 0 && (
        <div className="mb-10 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-semibold">مهارت‌های مرتبط</h2>
          <div className="flex flex-wrap gap-2">
            {relatedSkills.map((rs) => (
              <Link
                key={rs.id}
                href={`/projects/skills/${rs.slug}`}
                className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground hover:bg-primary-soft hover:text-primary transition-colors"
              >
                {rs.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Other Categories */}
      {otherCategories.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">سایر حوزه‌ها</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {otherCategories.map((cat) => (
              <Link key={cat.id} href={`/projects/${cat.slug}`}>
                <Card className="group transition-all hover:border-primary/30">
                  <CardContent className="p-4">
                    <h3 className="text-sm font-semibold group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {cat.skills.map((s) => {
                        const hireSlug = skillToHireRole[s.slug];
                        return hireSlug ? (
                          <Link
                            key={s.slug}
                            href={`/hire/${hireSlug}`}
                            className="text-xs text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {s.name}
                          </Link>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Bottom CTA */}
      <div className="rounded-xl bg-primary p-8 text-center text-white">
        <h2 className="text-xl font-bold sm:text-2xl">
          آماده‌اید پروژه تان را شروع کنید؟
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-primary-foreground/80">
          پروژه خود را ثبت کنید و در کمتر از ۲۴ ساعت اولین پیشنهادها را دریافت کنید.
        </p>
        <Button size="lg" variant="secondary" className="mt-6" asChild>
          <Link href="/projects/create">
            ثبت پروژه رایگان
            <ArrowLeft className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
