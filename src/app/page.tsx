import Link from "next/link";
import {
  ArrowLeft,
  Search,
  ShieldCheck,
  Target,
  UsersRound,
  BrainCircuit,
  Code2,
  LayoutGrid,
  Server,
  Smartphone,
  Palette,
  CloudCog,
  SearchCode,
  CheckCircle2,
  Briefcase,
  Send,
  Handshake,
  FileText,
  Eye,
  UserCheck,
  Rocket,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StructuredData } from "@/components/seo/structured-data";
import {
  generateOrganizationLd,
  generateWebSiteLd,
  generateItemListLd,
} from "@/lib/seo/structured-data";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const sampleProjects = [
  {
    id: "1",
    title: "طراحی داشبورد مدیریت SaaS با Next.js",
    slug: "saas-dashboard-nextjs",
    category: "فرانت‌اند",
    skills: ["React", "Next.js", "TypeScript"],
    description:
      "توسعه یک داشبورد مدیریتی حرفه‌ای برای محصول SaaS با قابلیت نمودارها و جداول پیشرفته",
    budget: "۳۰-۴۵ میلیون تومان",
    proposalCount: 6,
    proposalLimit: 10,
    matchScore: 92,
    isVerified: false,
  },
  {
    id: "2",
    title: "توسعه فروشگاه آنلاین با React و Node.js",
    slug: "online-store-react-node",
    category: "وب",
    skills: ["React", "Node.js", "MongoDB"],
    description:
      "طراحی و پیاده‌سازی فروشگاه آنلاین با سبد خرید، پرداخت و پنل مدیریت",
    budget: "۴۵-۶۰ میلیون تومان",
    proposalCount: 3,
    proposalLimit: 10,
    matchScore: 85,
    isVerified: true,
  },
  {
    id: "3",
    title: "بهینه‌سازی Core Web Vitals سایت فروشگاهی",
    slug: "core-web-vitals-optimization",
    category: "سئو",
    skills: ["SEO", "Next.js"],
    description:
      "بهبود سرعت و عملکرد سایت فروشگاهی برای رسیدن به امتیاز ۹۰+ در Core Web Vitals",
    budget: "۸-۱۲ میلیون تومان",
    proposalCount: 2,
    proposalLimit: 10,
    matchScore: 78,
    isVerified: false,
  },
  {
    id: "4",
    title: "توسعه پنل مدیریت با Vue.js",
    slug: "admin-panel-vue",
    category: "فرانت‌اند",
    skills: ["Vue.js", "TypeScript", "Tailwind"],
    description:
      "ساخت پنل مدیریت با قابلیت مدیریت کاربران، گزارش‌ها و تنظیمات",
    budget: "۲۵-۳۵ میلیون تومان",
    proposalCount: 5,
    proposalLimit: 10,
    matchScore: 88,
    isVerified: true,
  },
  {
    id: "5",
    title: "طراحی UI اپلیکیشن مالی در Figma",
    slug: "finance-app-ui-figma",
    category: "UI/UX",
    skills: ["Figma", "Prototyping"],
    description:
      "طراحی رابط کاربری اپلیکیشن مالی شامل داشبورد، تراکنش‌ها و کیف پول",
    budget: "۱۵-۲۰ میلیون تومان",
    proposalCount: 7,
    proposalLimit: 10,
    matchScore: 95,
    isVerified: false,
  },
  {
    id: "6",
    title: "پیاده‌سازی REST API با Django",
    slug: "rest-api-django",
    category: "بک‌اند",
    skills: ["Python", "Django", "PostgreSQL"],
    description:
      "طراحی و پیاده‌سازی REST API با احراز هویت JWT، مستندسازی و تست",
    budget: "۲۰-۳۰ میلیون تومان",
    proposalCount: 4,
    proposalLimit: 10,
    matchScore: 82,
    isVerified: true,
  },
  {
    id: "7",
    title: "بهینه‌سازی Technical SEO سایت شرکتی",
    slug: "technical-seo-audit",
    category: "سئو",
    skills: ["SEO", "Analytics"],
    description:
      "Audit کامل سئو تکنیکال و رفع مشکلات ساختاری، اسکیما و سرعت",
    budget: "۵-۱۰ میلیون تومان",
    proposalCount: 1,
    proposalLimit: 10,
    matchScore: 75,
    isVerified: false,
  },
  {
    id: "8",
    title: "توسعه افزونه اختصاصی WordPress",
    slug: "wordpress-custom-plugin",
    category: "وردپرس",
    skills: ["WordPress", "PHP", "JavaScript"],
    description:
      "ساخت افزونه مدیریت رزرو آنلاین با تقویم و سیستم پرداخت",
    budget: "۱۸-۲۵ میلیون تومان",
    proposalCount: 8,
    proposalLimit: 10,
    matchScore: 90,
    isVerified: true,
  },
];

const categories = [
  {
    label: "توسعه وب",
    icon: Code2,
    slug: "web-development",
    accent: "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300",
  },
  {
    label: "فرانت‌اند",
    icon: LayoutGrid,
    slug: "frontend",
    accent: "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300",
  },
  {
    label: "بک‌اند",
    icon: Server,
    slug: "backend",
    accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
  {
    label: "موبایل",
    icon: Smartphone,
    slug: "mobile-app-development",
    accent: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300",
  },
  {
    label: "UI/UX",
    icon: Palette,
    slug: "ui-ux-design",
    accent: "bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300",
  },
  {
    label: "هوش مصنوعی",
    icon: BrainCircuit,
    slug: "ai-machine-learning",
    accent: "bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300",
  },
  {
    label: "DevOps",
    icon: CloudCog,
    slug: "devops",
    accent: "bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300",
  },
  {
    label: "سئو",
    icon: SearchCode,
    slug: "seo-digital-marketing",
    accent: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
  },
];

const freelancerSteps = [
  { icon: CheckCircle2, label: "مهارت‌هایت را انتخاب کن" },
  { icon: Eye, label: "پروژه‌های مناسب را ببین" },
  { icon: Send, label: "پیشنهاد بده" },
  { icon: Handshake, label: "همکاری را شروع کن" },
];

const employerSteps = [
  { icon: FileText, label: "پروژه را ثبت کن" },
  { icon: UsersRound, label: "متخصص‌های مناسب را ببین" },
  { icon: UserCheck, label: "پیشنهادها را مقایسه کن" },
  { icon: Rocket, label: "بهترین گزینه را انتخاب کن" },
];

const popularSkills = [
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextjs" },
  { name: "WordPress", slug: "wordpress" },
  { name: "Python", slug: "python" },
  { name: "UI/UX", slug: "ui-design" },
  { name: "SEO", slug: "seo" },
  { name: "Node.js", slug: "nodejs" },
  { name: "AI", slug: "llm" },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toPersianDigits(str: string) {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  return str.replace(/[0-9]/g, (d) => persianDigits[parseInt(d)]);
}

function matchScoreColor(score: number) {
  if (score >= 90) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";
  if (score >= 80) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
  return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300";
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  /* Structured data */
  const skillItemsLd = popularSkills.map((s, i) => ({
    name: s.name,
    url: `/projects/skills/${s.slug}`,
    position: i + 1,
  }));

  return (
    <>
      <StructuredData data={generateOrganizationLd()} />
      <StructuredData data={generateWebSiteLd()} />
      <StructuredData
        data={generateItemListLd({
          name: "مهارت‌های پرطرفدار",
          url: "/",
          items: skillItemsLd,
        })}
      />

      {/* ============================================================ */}
      {/* 1. HERO                                                       */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden">
        {/* Subtle dot-pattern background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.35] dark:opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-border) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Pill badge */}
            <Badge
              variant="secondary"
              className="px-4 py-1.5 text-xs font-medium tracking-wide"
            >
              بازار هوشمند پروژه‌های تکنولوژی و دیجیتال
            </Badge>

            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold leading-tight text-text-primary">
              پروژه مناسب مهارتت را{" "}
              <span className="text-primary">پیدا کن</span>
            </h1>

            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              پروژه‌های واقعی و مرتبط با تخصصت را ببین، بدون رقابت میان
              صدها پیشنهاد نامرتبط.
            </p>

            {/* Search bar */}
            <div className="flex gap-2 max-w-xl mx-auto mt-10">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                <Input
                  type="search"
                  placeholder="مثلاً React، Next.js، طراحی سایت..."
                  className="ps-10 text-sm h-11 rounded-xl"
                />
              </div>
              <Button asChild className="h-11 rounded-xl">
                <Link href="/projects">جستجو</Link>
              </Button>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Button asChild size="lg" className="rounded-xl">
                <Link href="/projects">
                  مشاهده پروژه‌ها
                  <ArrowLeft className="ms-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-xl">
                <Link href="/projects/new">ثبت پروژه</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. TRUST INDICATORS                                          */}
      {/* ============================================================ */}
      <section className="border-y border-border bg-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: ShieldCheck,
                title: "بدون خرید توکن",
                desc: "ارسال پیشنهاد بدون هزینه اضافی",
              },
              {
                icon: Target,
                title: "پیشنهادهای محدود و مرتبط",
                desc: "رقابت واقعی بدون سر و صدای بی‌ربط",
              },
              {
                icon: UserCheck,
                title: "کارفرمای قابل ارزیابی",
                desc: "سابقه و امتیاز کارفرما قبل از همکاری",
              },
              {
                icon: BrainCircuit,
                title: "تطابق هوشمند پروژه",
                desc: "الگوریتم تطابق مهارت و نیاز پروژه",
              },
            ].map((item, idx) => (
              <div
                key={item.title}
                className="flex items-start gap-3 px-4 sm:px-6 py-5"
              >
                <div className="w-9 h-9 rounded-lg bg-primary-soft flex items-center justify-center shrink-0">
                  <item.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary leading-snug">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-muted leading-relaxed mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. RECENT PROJECTS                                           */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              جدیدترین پروژه‌ها
            </h2>
            <p className="text-sm text-text-muted mt-1">
              پروژه‌هایی که منتظر تخصص شما هستند
            </p>
          </div>
          <Link
            href="/projects"
            className="text-sm font-medium text-primary hover:underline underline-offset-4 flex items-center gap-1"
          >
            مشاهده همه
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sampleProjects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="card-base p-5 flex flex-col gap-3 group cursor-pointer"
            >
              {/* Top row: category + match score */}
              <div className="flex items-center justify-between">
                <Badge
                  variant="secondary"
                  className="text-[11px] font-medium px-2.5 py-0.5"
                >
                  {project.category}
                </Badge>
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${matchScoreColor(
                    project.matchScore
                  )}`}
                >
                  {toPersianDigits(`${project.matchScore}٪`)} تطابق
                </span>
              </div>

              {/* Title */}
              <h3 className="text-sm font-bold text-text-primary leading-relaxed line-clamp-2 group-hover:text-primary transition-colors">
                {project.title}
              </h3>

              {/* Description */}
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                {project.description}
              </p>

              {/* Skills */}
              <div className="flex flex-wrap gap-1.5">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="ltr-inline text-[11px] font-medium bg-muted text-text-secondary px-2 py-0.5 rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Bottom row */}
              <Separator className="my-0.5" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-text-primary">
                  {project.budget}
                </span>
                <div className="flex items-center gap-1.5">
                  {project.isVerified && (
                    <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                  )}
                  <span className="text-xs text-text-muted">
                    {toPersianDigits(
                      `${project.proposalCount}/${project.proposalLimit}`
                    )}{" "}
                    پیشنهاد
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. CATEGORIES                                                */}
      {/* ============================================================ */}
      <section className="bg-surface border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
              دسته‌بندی‌ها
            </h2>
            <p className="text-sm text-text-muted mt-1">
              تخصصت رو پیدا کن و شروع کن
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/projects/${cat.slug}`}
                className="card-base p-5 flex items-center gap-3 group cursor-pointer hover:border-primary/20"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.accent}`}
                >
                  <cat.icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. HOW IT WORKS                                              */}
      {/* ============================================================ */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            چطوری کار می‌کنه؟
          </h2>
          <p className="text-sm text-text-muted mt-1">
            در ۴ قدم ساده به نتیجه برسید
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Freelancers */}
          <div className="card-base p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  برای فریلنسرها
                </h3>
                <p className="text-xs text-text-muted">
                  از مهارتت درآمد بساز
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {freelancerSteps.map((step, idx) => (
                <div key={step.label} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    {toPersianDigits(String(idx + 1))}
                  </span>
                  <div className="pt-0.5">
                    <step.icon className="h-4 w-4 text-text-muted mb-1" />
                    <p className="text-sm font-medium text-text-primary">
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employers */}
          <div className="card-base p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-soft flex items-center justify-center">
                <UsersRound className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  برای کارفرمایان
                </h3>
                <p className="text-xs text-text-muted">
                  بهترین متخصص رو پیدا کن
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {employerSteps.map((step, idx) => (
                <div key={step.label} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                    {toPersianDigits(String(idx + 1))}
                  </span>
                  <div className="pt-0.5">
                    <step.icon className="h-4 w-4 text-text-muted mb-1" />
                    <p className="text-sm font-medium text-text-primary">
                      {step.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. BOTTOM CTA                                                */}
      {/* ============================================================ */}
      <section className="brand-gradient">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            متخصص مناسب پروژه‌ات را سریع‌تر پیدا کن
          </h2>
          <p className="text-white/75 mb-8 max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            پروژه خود را ثبت کنید و از بین متخصص‌های تأییدشده، بهترین را
            انتخاب کنید.
          </p>
          <Button
            size="lg"
            variant="secondary"
            asChild
            className="rounded-xl font-semibold"
          >
            <Link href="/projects/new">
              ثبت پروژه رایگان
              <ArrowLeft className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
