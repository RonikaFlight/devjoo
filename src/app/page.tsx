import Link from "next/link";
import { ArrowLeft, Search, Sparkles, Users, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StructuredData } from "@/components/seo/structured-data";
import { generateOrganizationLd, generateWebSiteLd, generateItemListLd } from "@/lib/seo/structured-data";

const popularSkills = [
  { name: 'React', slug: 'react' },
  { name: 'Next.js', slug: 'nextjs' },
  { name: 'WordPress', slug: 'wordpress' },
  { name: 'Python', slug: 'python' },
  { name: 'UI/UX', slug: 'ui-ux' },
  { name: 'SEO', slug: 'seo' },
  { name: 'Node.js', slug: 'nodejs' },
  { name: 'AI', slug: 'ai' },
];

const differentiators = [
  {
    icon: Sparkles,
    title: 'DevJoo Match',
    description: 'الگوریتم هوشمند تطابق مهارت و پروژه'
  },
  {
    icon: Users,
    title: 'حداکثر پیشنهادهای مرتبط',
    description: 'دیگر لازم نیست با صدها پیشنهاد رقابت کنید'
  },
  {
    icon: Shield,
    title: 'بدون خرید توکن',
    description: 'ارسال پیشنهاد بدون هزینه اضافی'
  },
  {
    icon: Zap,
    title: 'ثبت‌نام سریع',
    description: 'در کمتر از ۳۰ ثانیه وارد شوید'
  },
];

export default function HomePage() {
  const skillItemsLd = popularSkills.map((s, i) => ({
    name: s.name,
    url: `/projects/${s.slug}`,
    position: i + 1,
  }));

  return (
    <>
      <StructuredData data={generateOrganizationLd()} />
      <StructuredData data={generateWebSiteLd()} />
      <StructuredData
        data={generateItemListLd({
          name: 'مهارت‌های پرطرفدار',
          url: '/',
          items: skillItemsLd,
        })}
      />
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="text-xs">
              بازار هوشمند پروژه‌های تکنولوژی و دیجیتال
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
              پروژه مناسب مهارتت را{' '}
              <span className="text-primary">پیدا کن</span>
            </h1>
            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              پروژه‌های واقعی و مرتبط با مهارتت را ببین، بدون رقابت بین صدها پیشنهاد بی‌ربط.
            </p>

            {/* Search Bar */}
            <div className="flex gap-2 max-w-xl mx-auto mt-8">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                <Input
                  type="search"
                  placeholder="جستجوی پروژه... (مثلا: طراحی داشبورد React)"
                  className="pr-10 text-sm"
                  dir="rtl"
                />
              </div>
              <Button asChild>
                <Link href="/projects">
                  جستجو
                </Link>
              </Button>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button asChild variant="default" size="lg">
                <Link href="/projects">
                  پروژه پیدا کن
                  <ArrowLeft className="mr-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/hire">
                  متخصص پیدا کن
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Projects - Empty State */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">جدیدترین پروژه‌ها</h2>
          <Link href="/projects" className="text-sm text-primary hover:underline">
            مشاهده همه
          </Link>
        </div>
        <div className="border border-dashed border-border rounded-2xl p-12 text-center">
          <p className="text-text-secondary text-sm">
            هنوز پروژه‌ای ثبت نشده است. اولین پروژه را ایجاد کنید!
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/projects/create">ثبت پروژه</Link>
          </Button>
        </div>
      </section>

      {/* Popular Skills */}
      <section className="bg-surface border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-xl font-bold mb-8 text-center">مهارت‌های پرطرفدار</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {popularSkills.map((skill) => (
              <Link key={skill.slug} href={`/projects/${skill.slug}`}>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm cursor-pointer hover:bg-primary-soft hover:text-primary transition-colors"
                >
                  {skill.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Differentiators */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xl font-bold mb-8 text-center">چرا DevJoo؟</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {differentiators.map((item) => (
            <div
              key={item.title}
              className="p-6 rounded-xl border border-border bg-surface shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-soft flex items-center justify-center mb-4">
                <item.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA for Employers */}
      <section className="bg-primary text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            متخصص مناسب پروژه‌ات را سریع‌تر پیدا کن
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-lg mx-auto">
            پروژه خود را ثبت کنید و از بین متخصص‌های تأییدشده، بهترین را انتخاب کنید.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/projects/create">
              ثبت پروژه رایگان
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
