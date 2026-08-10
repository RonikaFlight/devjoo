/**
 * DevJoo Comprehensive Seed Script
 * 
 * Creates demo users, profiles, projects, proposals, reviews,
 * notifications, conversations, blog posts, and service listings.
 * 
 * Idempotent: checks counts before creating.
 * Runnable: npx tsx prisma/seed-comprehensive.ts
 * 
 * DEMO ACCOUNTS (password: devjoo123 for all):
 *   Freelancer:  علیرضایی@devjoo.local   (phone: 09121000001)
 *   Employer:   دیجیتال‌لب(استارتاپSaaS)@devjoo.local  (phone: 09122000001)
 *   Admin:      ادمینسیستم@devjoo.local  (phone: 09123000001)
 */

import { db } from '../src/lib/db';
import { hash } from 'bcryptjs';
import {
  USER_ROLES,
  PROJECT_STATUS,
  PROPOSAL_STATUS,
  EXPERIENCE_LEVEL,
  AVAILABILITY,
  PROFICIENCY_LEVEL,
  NOTIFICATION_TYPE,
  MESSAGE_TYPE,
  SERVICE_LISTING_STATUS,
} from '../src/types/enums';

// ─── Helpers ───────────────────────────────────────────────────────────────

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number, decimals = 1): number {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function hoursAgo(hours: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d;
}

function slugify(text: string): string {
  return text
    .replace(/\s+/g, '-')
    .replace(/[^\u0000-\u007F\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

// ─── Data Definitions ──────────────────────────────────────────────────────

const FREELANCER_NAMES = [
  'علی رضایی', 'سارا محمدی', 'رضا حسینی', 'مریم کریمی', 'امیر تهرانی',
  'فاطمه احمدی', 'محمد موسوی', 'نرگس جعفری', 'حسین عباسی', 'زهرا نوری',
  'پویا شفیعی', 'مهسا صادقی', 'آرش کمالی', 'الهام رحیمی', 'بهنام یوسفی',
  'شیدا قاسمی', 'دانیال میرزایی', 'نیلوفر اکبری', 'کیان پورمحمدی', 'درسا عابدی',
];

const EMPLOYER_NAMES = [
  'دیجیتال‌لب (استارتاپ SaaS)',
  'فروشگاه نوین',
  'آژانس وب‌نگار',
  'شرکت فناوری پارسه',
  'کسب‌وکار فردی (محمدی)',
  'فین‌تک پارس',
  'مارکت‌پلیس کالا',
  'استودیو طراحی آتیه‌نگار',
];

const ADMIN_NAMES = ['ادمین سیستم', 'ناظر سایت'];

const FREELANCER_HEADLINES = [
  'Senior Frontend Developer | React & Next.js',
  'طراح UI/UX | Figma & Adobe XD',
  'Backend Developer | Node.js & Python',
  'Full Stack Developer | React & NestJS',
  'متخصص وردپرس و PHP',
  'طراح گرافیک و موشن گرافیک',
  'Mobile Developer | Flutter & React Native',
  'DevOps Engineer | Docker & Kubernetes',
  'متخصص SEO و بازاریابی دیجیتال',
  'Data Engineer | Python & SQL',
  'AI/ML Engineer | TensorFlow & PyTorch',
  'برنامه‌نویس Python | Django & Flask',
  'Frontend Developer | Vue.js & Nuxt',
  'Cybersecurity Specialist',
  'QA Engineer | Automation Testing',
  'توسعه‌دهنده API | REST & GraphQL',
  'UI Designer | Figma & Design Systems',
  'Backend Developer | Go & Rust',
  'Full Stack Developer | Next.js & Prisma',
  'طراح UX | User Research & Prototyping',
];

const FREELANCER_BIOS = [
  'بیش از ۶ سال تجربه در توسعه فرانت‌اند با React و Next.js. تخصص در ساخت اپلیکیشن‌های وب با عملکرد بالا و مقیاس‌پذیر. آشنایی کامل با TypeScript و سیستم‌های طراحی.',
  'طراح رابط کاربری و تجربه کاربری با ۵ سال سابقه حرفه‌ای. تخصص در طراحی سیستم‌های طراحی مقیاس‌پذیر و پروتوتایپ‌های تعاملی با Figma. تجربه کار با تیم‌های محصول.',
  'توسعه‌دهنده بک‌اند با تسلط بر Node.js و Python. تجربه در طراحی و پیاده‌سازی میکروسرویس‌ها و APIهای RESTful. آشنایی با معماری‌های مقیاس‌پذیر.',
  'توسعه‌دهنده فول‌استک با ۷ سال تجربه. مسلط به React در فرانت‌اند و NestJS در بک‌اند. تجربه در طراحی دیتابیس و پیاده‌سازی CI/CD.',
  'متخصص وردپرس با ۸ سال تجربه در طراحی و توسعه سایت‌های وردپرسی. تسلط بر توسعه افزونه و قالب اختصاصی. بهینه‌سازی سرعت و امنیت سایت‌های وردپرسی.',
  'طراح گرافیک و موشن گرافیک با تخصص در Adobe After Effects و Blender. ساخت ویدیوهای تبلیغاتی، اینترو و لوگو انیمیشن برای برندهای مختلف.',
  'توسعه‌دهنده موبایل با ۴ سال تجربه در Flutter و React Native. ساخت اپلیکیشن‌های کراس‌پلتفرم با عملکرد بومی. تجربه در اپلیکیشن‌های مالی و تجارت الکترونیک.',
  'مهندس DevOps با تسلط بر Docker، Kubernetes و CI/CD. تجربه در مدیریت زیرساخت‌های ابری AWS و بهینه‌سازی عملکرد سرورها.',
  'متخصص سئو با ۶ سال تجربه در بهینه‌سازی سایت‌های فارسی. افزایش ترافیک ارگانیک و بهبود رتبه در گوگل. تجربه در آنالیز داده و Google Analytics.',
  'مهندس دیتا با تسلط بر Python، SQL و ابزارهای BI. تجربه در ساخت داشبوردهای تحلیلی و ETL Pipeline. آشنایی با Apache Spark و پردازش داده‌های بزرگ.',
  'مهندس هوش مصنوعی با تخصص در NLP و بینایی ماشین. تجربه در ساخت مدل‌های یادگیری عمیق و پیاده‌سازی RAG. کار با TensorFlow و PyTorch.',
  'برنامه‌نویس Python با ۵ سال تجربه در Django و Flask. ساخت APIهای RESTful و وب‌سرویس‌ها. آشنایی با پردازش داده و اتوماسیون.',
  'توسعه‌دهنده فرانت‌اند با تخصص در Vue.js و Nuxt. تجربه در ساخت اپلیکیشن‌های SPA و SSR. آشنایی با Tailwind CSS و سیستم‌های طراحی.',
  'متخصص امنیت سایبری با ۶ سال تجربه در تست نفوذ و امنیت وب. آشنایی با استانداردهای OWASP و رمزنگاری. تجربه در امن‌سازی زیرساخت‌ها.',
  'مهندس تست با تخصص در اتوماسیون تست با Cypress و Playwright. تجربه در طراحی استراتژی تست و پیاده‌سازی CI/CD برای تست. آشنایی با Jest.',
  'متخصص توسعه API با تسلط بر REST و GraphQL. تجربه در طراحی API Gateway و میکروسرویس‌ها. آشنایی با احراز هویت و امنیت API.',
  'طراح رابط کاربری با ۴ سال تجربه در Figma. تخصص در ساخت Design System و کامپوننت‌لایبرری. آشنایی با اصول دسترسی‌پذیری.',
  'توسعه‌دهنده بک‌اند با تسلط بر Go و Rust. تجربه در ساخت سیستم‌های با عملکرد بالا و همزمانی. آشنایی با gRPC و میکروسرویس‌ها.',
  'توسعه‌دهنده فول‌استک با تخصص در Next.js و Prisma ORM. تجربه در ساخت SaaS و اپلیکیشن‌های بلادرنگ. تسلط بر TypeScript و Tailwind CSS.',
  'متخصص UX با ۵ سال تجربه در تحقیق کاربر و طراحی تجربه کاربری. تخصص در تست کاربری و طراحی مبتنی بر داده. تجربه در محصولات B2B و B2C.',
];

// Freelancer skills mapped by index -> array of skill slugs
const FREELANCER_SKILLS: string[][] = [
  ['react', 'nextjs', 'typescript', 'tailwind-css', 'javascript'],           // علی - Senior Frontend
  ['figma', 'adobe-xd', 'ui-design', 'ux-design', 'design-system'],         // سارا - UI/UX
  ['nodejs', 'python', 'rest-api', 'postgresql', 'docker'],                  // رضا - Backend
  ['react', 'nestjs', 'typescript', 'postgresql', 'graphql', 'docker'],     // مریم - Full Stack
  ['wordpress', 'php', 'html-css', 'javascript', 'seo'],                     // امیر - WordPress
  ['after-effects', 'adobe-photoshop', 'adobe-illustrator', 'motion-graphics', 'blender'], // فاطمه - Graphic
  ['flutter', 'dart', 'react-native', 'firebase'],                            // محمد - Mobile (firebase not in DB, skip)
  ['docker', 'kubernetes', 'linux', 'github-actions', 'ci-cd', 'terraform'], // نرگس - DevOps
  ['seo', 'google-analytics', 'google-ads', 'content-writing'],              // حسین - SEO
  ['python', 'sql', 'pandas', 'data-analysis', 'power-bi'],                  // زهرا - Data
  ['python', 'tensorflow', 'pytorch', 'nlp', 'llm'],                         // پویا - AI/ML
  ['python', 'django', 'flask', 'rest-api', 'postgresql'],                   // مهسا - Python/Django
  ['vuejs', 'typescript', 'tailwind-css', 'javascript', 'html-css'],         // آرش - Vue.js
  ['penetration-testing', 'web-security', 'owasp', 'cryptography', 'linux'], // الهام - Cybersecurity
  ['cypress', 'playwright', 'jest', 'typescript', 'javascript'],             // بهنام - QA
  ['nodejs', 'rest-api', 'graphql', 'postgresql', 'redis', 'nestjs'],        // شیدا - API
  ['figma', 'ui-design', 'design-system', 'wireframing', 'prototyping'],     // دانیال - UI Designer
  ['nodejs', 'docker', 'rest-api', 'postgresql', 'linux'],                   // نیلوفر - Backend Go/Rust
  ['nextjs', 'typescript', 'react', 'tailwind-css', 'postgresql'],           // کیان - Full Stack Next.js
  ['ux-design', 'figma', 'wireframing', 'prototyping', 'ui-design'],         // درسا - UX
];

const FREELANCER_SKILL_PROFICIENCY: string[][] = [
  ['EXPERT', 'EXPERT', 'EXPERT', 'ADVANCED', 'EXPERT'],
  ['EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED', 'ADVANCED'],
  ['EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED', 'INTERMEDIATE'],
  ['EXPERT', 'EXPERT', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED'],
  ['EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED', 'INTERMEDIATE'],
  ['EXPERT', 'ADVANCED', 'ADVANCED', 'EXPERT', 'INTERMEDIATE'],
  ['EXPERT', 'EXPERT', 'ADVANCED'],
  ['EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED', 'EXPERT', 'INTERMEDIATE'],
  ['EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED'],
  ['EXPERT', 'EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED'],
  ['EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED', 'EXPERT'],
  ['EXPERT', 'EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED'],
  ['EXPERT', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED'],
  ['EXPERT', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED'],
  ['EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED', 'ADVANCED'],
  ['EXPERT', 'EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED', 'EXPERT'],
  ['EXPERT', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED'],
  ['EXPERT', 'ADVANCED', 'EXPERT', 'ADVANCED', 'EXPERT'],
  ['EXPERT', 'EXPERT', 'EXPERT', 'ADVANCED', 'ADVANCED'],
  ['EXPERT', 'EXPERT', 'ADVANCED', 'ADVANCED', 'ADVANCED'],
];

const EMPLOYER_COMPANY_TYPES = [
  'STARTUP', 'COMPANY', 'AGENCY', 'COMPANY', 'INDIVIDUAL', 'FINTECH', 'MARKETPLACE', 'STUDIO',
];

const EMPLOYER_COMPANY_SIZES = [
  'MICRO', 'SMALL', 'SMALL', 'MEDIUM', 'MICRO', 'SMALL', 'MEDIUM', 'SMALL',
];

// ─── Project Data ──────────────────────────────────────────────────────────

interface ProjectSeed {
  title: string;
  slug: string;
  categorySlug: string;
  skillSlugs: string[];
  budgetMin: number;
  budgetMax: number;
  duration: string;
  experienceLevel: string;
  status: string;
  isFeatured: boolean;
  description: string;
}

const PROJECTS: ProjectSeed[] = [
  {
    title: 'طراحی داشبورد مدیریت SaaS با Next.js',
    slug: 'saas-dashboard-nextjs',
    categorySlug: 'web-development',
    skillSlugs: ['nextjs', 'typescript', 'tailwind-css'],
    budgetMin: 30_000_000,
    budgetMax: 80_000_000,
    duration: '1-3 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: true,
    description: 'ما یک استارتاپ SaaS هستیم و نیاز به داشبورد مدیریتی کامل داریم. داشبورد باید شامل نمودارهای فروش، مدیریت کاربران، گزارش‌گیری مالی و تنظیمات سیستم باشد. طراحی باید ریسپانسیو و با پرفورمنس بالا باشد.\n\nتکنولوژی‌های مورد نیاز: Next.js 14 با App Router، TypeScript، Tailwind CSS و shadcn/ui. دیتابیس با Prisma و PostgreSQL. نیاز به پیاده‌سازی SSR و بهینه‌سازی SEO.\n\nطراحی UI/UX قبلا انجام شده و فایل‌های Figma موجود است. نیاز به پیاده‌سازی دقیق طراحی با توجه به جزئیات. باید از کامپوننت‌های قابل استفاده مجدد استفاده شود.',
  },
  {
    title: 'توسعه فروشگاه آنلاین با React و Node.js',
    slug: 'online-store-react-nodejs',
    categorySlug: 'web-development',
    skillSlugs: ['react', 'nodejs', 'mongodb', 'rest-api'],
    budgetMin: 50_000_000,
    budgetMax: 120_000_000,
    duration: '2-3 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: true,
    description: 'نیاز به توسعه یک فروشگاه آنلاین کامل با قابلیت مدیریت محصولات، سبد خرید، پرداخت آنلاین و پنل ادمین داریم. فروشگاه باید از چند زبان پشتیبانی کند و ریسپانسیو باشد.\n\nبک‌اند با Node.js و Express، دیتابیس MongoDB. فرانت‌اند با React و Redux Toolkit. پیاده‌سازی درگاه پرداخت زرین‌پال. سیستم احراز هویت با JWT.\n\nنکته مهم: کد باید تمیز و مستندسازی شده باشد. تست واحد برای بخش‌های حیاتی الزامی است. ما از Git و GitHub برای مدیریت کد استفاده می‌کنیم.',
  },
  {
    title: 'بهینه‌سازی Core Web Vitals سایت فروشگاهی',
    slug: 'core-web-vitals-optimization',
    categorySlug: 'seo-digital-marketing',
    skillSlugs: ['seo', 'javascript', 'html-css'],
    budgetMin: 5_000_000,
    budgetMax: 15_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'سایت فروشگاهی ما مشکل سرعت دارد و امتیاز Core Web Vitals در گوگل پایین است. نیاز به متخصصی داریم که بتواند مشکل را تشخیص داده و رفع کند.\n\nمشکلات اصلی: LCP بالاست، CLS در صفحات محصول problematic است و FID نیاز به بهبود دارد. سایت با React ساخته شده و از SSR استفاده می‌کند.\n\nهدف: رسیدن به امتیاز سبز در تمام معیارهای Core Web Vitals در PageSpeed Insights. ارائه گزارش قبل و بعد از بهینه‌سازی.',
  },
  {
    title: 'توسعه پنل مدیریت با Vue.js',
    slug: 'admin-panel-vuejs',
    categorySlug: 'web-development',
    skillSlugs: ['vuejs', 'typescript', 'tailwind-css'],
    budgetMin: 20_000_000,
    budgetMax: 50_000_000,
    duration: '1-2 ماه',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'توسعه پنل مدیریت برای سیستم رزرو آنلاین. پنل باید شامل مدیریت کاربران، مشاهده گزارش‌ها، مدیریت تنظیمات و داشبورد با نمودار باشد.\n\nفرانت‌اند با Vue 3 و Composition API. استفاده از Pinia برای state management و Vue Router. طراحی با Tailwind CSS. بک‌اند API از قبل آماده است.\n\nنیاز به پیاده‌سازی دسترسی‌های مبتنی بر نقش (RBAC) و لاگ فعالیت‌های ادمین. طراحی باید ریسپانسیو و سازگار با موبایل باشد.',
  },
  {
    title: 'طراحی UI اپلیکیشن مالی در Figma',
    slug: 'fintech-ui-design-figma',
    categorySlug: 'ui-ux-design',
    skillSlugs: ['figma', 'ui-design', 'prototyping', 'design-system'],
    budgetMin: 15_000_000,
    budgetMax: 40_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: true,
    description: 'طراحی رابط کاربری اپلیکیشن فین‌تک شامل: داشبورد اصلی، صفحه تراکنش‌ها، فرم انتقال وجه، مدیریت کارت‌ها و تنظیمات پروفایل.\n\nطراحی باید مدرن، تمیز و قابل اعتماد باشد. استفاده از Design System موجود شرکت. نیاز به طراحی برای موبایل (iOS و Android) و وب.\n\nتحویل فایل‌های Figma با لایه‌بندی منظم و مشخصات دقیق برای توسعه‌دهندگان. نیاز به طراحی حالت‌های مختلف (empty state, loading, error) برای هر صفحه.',
  },
  {
    title: 'پیاده‌سازی REST API با Django',
    slug: 'rest-api-django',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['django', 'python', 'postgresql', 'rest-api'],
    budgetMin: 25_000_000,
    budgetMax: 60_000_000,
    duration: '1-2 ماه',
    experienceLevel: 'SENIOR',
    status: 'IN_PROGRESS',
    isFeatured: false,
    description: 'پیاده‌سازی REST API برای اپلیکیشن مدیریت پروژه. API باید شامل احراز هویت JWT، مدیریت کاربران، پروژه‌ها، وظایف و کامنت‌ها باشد.\n\nفریمورک Django REST Framework. دیتابیس PostgreSQL. پیاده‌سازی pagination، filtering و searching. مستندسازی API با Swagger/OpenAPI.\n\nنوشتن تست‌های واحد و یکپارچگی. پیاده‌سازی rate limiting و caching با Redis. کد باید از اصول SOLID پیروی کند.',
  },
  {
    title: 'بهینه‌سازی Technical SEO سایت شرکتی',
    slug: 'technical-seo-optimization',
    categorySlug: 'seo-digital-marketing',
    skillSlugs: ['seo', 'google-analytics'],
    budgetMin: 8_000_000,
    budgetMax: 20_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'COMPLETED',
    isFeatured: false,
    description: 'سایت شرکتی ما نیاز به بهینه‌سازی Technical SEO دارد. مشکلاتی مانند structured data ناقص، sitemap ناسازگار و مشکلات crawl budget وجود دارد.\n\nسایت با Next.js ساخته شده. نیاز به بررسی و رفع تمامی مشکلات Technical SEO، پیاده‌سازی Schema.org مناسب و بهبود ساختار URL.\n\nارائه گزارش کامل از مشکلات شناسایی شده و اقدامات انجام شده. هدف افزایش ترافیک ارگانیک حداقل ۳۰٪ در ۳ ماه.',
  },
  {
    title: 'توسعه افزونه اختصاصی WordPress',
    slug: 'custom-wordpress-plugin',
    categorySlug: 'web-development',
    skillSlugs: ['wordpress', 'php', 'javascript'],
    budgetMin: 10_000_000,
    budgetMax: 30_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'توسعه افزونه وردپرس برای مدیریت رزرو آنلاین. افزونه باید شامل تقویم رزرو، مدیریت زمان‌های آزاد، اعلان ایمیلی و اتصال به درگاه پرداخت باشد.\n\nکد باید استاندارد وردپرس باشد و از هوک‌های مناسب استفاده کند. نیاز به پنل تنظیمات در ادمین. سازگاری با قالب‌های مختلف.\n\nافزونه باید bilingual باشد (فارسی و انگلیسی) و از WP REST API پشتیبانی کند. ارائه مستندات فنی کامل.',
  },
  {
    title: 'ساخت اپلیکیشن موبایل با Flutter',
    slug: 'mobile-app-flutter',
    categorySlug: 'mobile-app-development',
    skillSlugs: ['flutter', 'dart', 'firebase'],
    budgetMin: 60_000_000,
    budgetMax: 150_000_000,
    duration: '2-4 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: true,
    description: 'ساخت اپلیکیشن موبایل برای خدمات مسافرتی شامل: جستجوی پرواز، رزرو هتل، نقشه شهری و راهنمای سفر. اپلیکیشن باید برای iOS و Android باشد.\n\nفریمورک Flutter با معماری Clean Architecture. استفاده از BLoC/Cubit برای state management. اتصال به APIهای موجود. پیاده‌سازی push notification.\n\nطراحی UI باید Material Design 3 را رعایت کند و از انیمیشن‌های نرم استفاده شود. نیاز به آفلاین مود اولیه و caching هوشمند.',
  },
  {
    title: 'پیاده‌سازی سیستم پرداخت آنلاین',
    slug: 'online-payment-system',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['nodejs', 'rest-api', 'postgresql'],
    budgetMin: 40_000_000,
    budgetMax: 100_000_000,
    duration: '1-3 ماه',
    experienceLevel: 'EXPERT',
    status: 'PUBLISHED',
    isFeatured: true,
    description: 'پیاده‌سازی سیستم پرداخت آنلاین با پشتیبانی از چند درگاه پرداخت (زرین‌پال، آیدی‌پی). سیستم باید شامل مدیریت تراکنش‌ها، reconciliation و گزارش‌گیری باشد.\n\nبک‌اند با Node.js. دیتابیس PostgreSQL. پیاده‌سازی وب‌هوک برای دریافت نتیجه تراکنش. سیستم retry برای تراکنش‌های ناموفق.\n\nامنیت بسیار مهم است. نیاز به پیاده‌سازی رمزنگاری داده‌های حساس، rate limiting و مانیتورینگ تراکنش‌ها. ارائه مستندات API کامل.',
  },
  {
    title: 'طراحی وب‌سایت شرکتی چندزبانه',
    slug: 'multilingual-corporate-website',
    categorySlug: 'web-development',
    skillSlugs: ['nextjs', 'tailwind-css', 'typescript'],
    budgetMin: 15_000_000,
    budgetMax: 35_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'طراحی و توسعه وب‌سایت شرکتی با پشتیبانی از سه زبان (فارسی، عربی، انگلیسی). سایت باید شامل صفحات: خانه، درباره ما، خدمات، بلاگ و تماس باشد.\n\nفریمورک Next.js با i18n. طراحی RTL و LTR. استفاده از Tailwind CSS و انیمیشن‌های ساده. CMS ساده برای مدیریت محتوا.\n\nبهینه‌سازی SEO برای هر زبان. سرعت لود صفحات زیر ۲ ثانیه. طراحی ریسپانسیو و سازگار با تمام دستگاه‌ها.',
  },
  {
    title: 'توسعه چت‌بات هوشمند با Python',
    slug: 'ai-chatbot-python',
    categorySlug: 'ai-machine-learning',
    skillSlugs: ['python', 'llm', 'nlp', 'openai-api'],
    budgetMin: 25_000_000,
    budgetMax: 70_000_000,
    duration: '1-2 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: true,
    description: 'توسعه چت‌بات هوشمند برای پشتیبانی آنلاین مشتریان. چت‌بات باید بتواند به سوالات متداول پاسخ دهد و در صورت نیاز به اپراتور انسانی ارجاع دهد.\n\nاستفاده از OpenAI API یا مدل open-source. پیاده‌سازی RAG با استفاده از پایگاه دانش شرکت. دیتابیس PostgreSQL برای ذخیره مکالمات.\n\nAPI برای اتصال به وب‌سایت و تلگرام. پنل مدیریت برای آموزش چت‌بات و مشاهده آمار. نیاز به پشتیبانی از زبان فارسی.',
  },
  {
    title: 'ساخت ربات تلگرام مدیریت سفارشات',
    slug: 'telegram-order-bot',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['nodejs', 'python', 'rest-api'],
    budgetMin: 8_000_000,
    budgetMax: 20_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'ساخت ربات تلگرام برای مدیریت سفارشات رستوران. مشتریان بتوانند از طریق ربات منو را مشاهده، سفارش ثبت و وضعیت سفارش را پیگیری کنند.\n    \nربات با Python یا Node.js. دیتابیس SQLite یا PostgreSQL. اتصال به درگاه پرداخت. پنل ادمین وب‌محور برای مدیریت منو و سفارشات.\n\nپشتیبانی از کیبورد شیشه‌ای و inline buttons. ارسال اعلان برای وضعیت سفارش. قابلیت ارسال فاکتور.',
  },
  {
    title: 'بهینه‌سازی عملکرد دیتابیس PostgreSQL',
    slug: 'postgresql-performance-optimization',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['postgresql', 'sql', 'linux'],
    budgetMin: 10_000_000,
    budgetMax: 30_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'EXPERT',
    status: 'COMPLETED',
    isFeatured: false,
    description: 'دیتابیس PostgreSQL ما با افزایش حجم داده‌ها کند شده است. نیاز به متخصصی داریم که queryهای کند را شناسایی و بهینه‌سازی کند.\n\nبررسی و بهینه‌سازی index‌ها، query plan‌ها و ساختار دیتابیس. پیاده‌سازی partitioning برای جداول بزرگ. تنظیمات بهینه PostgreSQL برای سرور ما.\n\nارائه گزارش کامل از تغییرات و نتایج بنچمارک قبل و بعد. هدف کاهش زمان پاسخ queryهای حیاتی حداقل ۵۰٪.',
  },
  {
    title: 'طراحی و توسعه لندینگ پیج تبلیغاتی',
    slug: 'landing-page-design',
    categorySlug: 'ui-ux-design',
    skillSlugs: ['figma', 'ui-design', 'html-css', 'tailwind-css'],
    budgetMin: 5_000_000,
    budgetMax: 15_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'طراحی و توسعه لندینگ پیج برای کمپین تبلیغاتی محصول جدید. صفحه باید شامل hero section، ویژگی‌های محصول، نظرات مشتریان، قیمت‌گذاری و فرم ثبت‌نام باشد.\n\nطراحی در Figma و سپس پیاده‌سازی با HTML/CSS/JS یا Next.js. انیمیشن‌های scroll-based. بهینه‌سازی برای تبدیل (CRO).\n\nطراحی باید مدرن و جذاب باشد و با برندینگ شرکت هماهنگ. ریسپانسیو و سازگار با تمام مرورگرها. ارائه فایل‌های Figma.',
  },
  {
    title: 'پیاده‌سازی CI/CD Pipeline با GitHub Actions',
    slug: 'cicd-github-actions',
    categorySlug: 'testing-devops',
    skillSlugs: ['github-actions', 'ci-cd', 'docker', 'terraform'],
    budgetMin: 10_000_000,
    budgetMax: 25_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'پیاده‌سازی CI/CD Pipeline کامل با GitHub Actions برای پروژه Next.js. شامل تست خودکار، build، deployment و مانیتورینگ.\n\nPipeline شامل: lint، تست واحد، تست یکپارچگی، build Docker image، push به registry و deployment به سرور. استقرار با Terraform.\n\nنیاز به پیاده‌سازی environment های dev، staging و production. تنظیم secrets و مدیریت متغیرهای محیطی. مستندسازی کامل فرآیند.',
  },
  {
    title: 'توسعه وب‌سایت خبری با Next.js',
    slug: 'news-website-nextjs',
    categorySlug: 'web-development',
    skillSlugs: ['nextjs', 'typescript', 'tailwind-css', 'seo'],
    budgetMin: 25_000_000,
    budgetMax: 60_000_000,
    duration: '1-2 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'توسعه وب‌سایت خبری با Next.js شامل: صفحه اصلی، دسته‌بندی‌ها، مقالات، جستجو و پنل مدیریت محتوا. سایت باید سرعت بسیار بالایی داشته باشد.\n\nNext.js 14 با App Router و ISR. CMS headless (Strapi یا Sanity). بهینه‌سازی شدید SEO و Core Web Vitals. پشتیبانی AMP برای مقالات.\n\nسیستم کش پیشرفته. جستجوی full-text. پشتیبانی RTL. پنل ساده برای نویسندگان. هدف Lighthouse score بالای ۹۰ در تمام معیارها.',
  },
  {
    title: 'ساخت پنل گزارش‌گیری و آنالیتیکس',
    slug: 'analytics-dashboard',
    categorySlug: 'data-analytics',
    skillSlugs: ['data-analysis', 'sql', 'power-bi', 'python'],
    budgetMin: 20_000_000,
    budgetMax: 50_000_000,
    duration: '1-2 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'ساخت داشبورد گزارش‌گیری برای نمایش داده‌های فروش، بازاریابی و عملکرد. داشبورد باید قابلیت فیلتر و export گزارش داشته باشد.\n\nفرانت‌اند با React یا Next.js. استفاده از Chart.js یا Recharts برای نمودارها. اتصال به دیتابیس PostgreSQL. پیاده‌سازی ETL برای داده‌های خام.\n\nنمودارهای: فروش ماهانه، ترافیک سایت، نرخ تبدیل، منابع ترافیک و عملکرد کمپین‌ها. قابلیت ساخت گزارش سفارشی. دسترسی مبتنی بر نقش.',
  },
  {
    title: 'طراحی اپلیکیشن یادگیری زبان',
    slug: 'language-learning-app-design',
    categorySlug: 'mobile-app-development',
    skillSlugs: ['figma', 'ui-design', 'ux-design', 'prototyping'],
    budgetMin: 15_000_000,
    budgetMax: 35_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'طراحی کامل UI/UX اپلیکیشن یادگیری زبان انگلیسی برای فارسی‌زبانان. شامل: onboarding، درس‌ها، تمرینات، پروفایل کاربر و سیستم gamification.\n\nطراحی در Figma با توجه به اصول UX برای اپلیکیشن‌های آموزشی. انیمیشن‌های تعاملی برای بازخورد. طراحی تم و آیکون‌ها.\n\nتحویل: فایل‌های Figma با تمام صفحات و state‌ها. Design System شامل typography، colors و components. پروتوتایپ قابل کلیک.',
  },
  {
    title: 'پیاده‌سازی API Gateway با Node.js',
    slug: 'api-gateway-nodejs',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['nodejs', 'rest-api', 'docker', 'redis'],
    budgetMin: 30_000_000,
    budgetMax: 70_000_000,
    duration: '1-2 ماه',
    experienceLevel: 'EXPERT',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'پیاده‌سازی API Gateway برای مدیریت ترافیک بین چندین میکروسرویس. شامل: rate limiting، authentication، logging و load balancing.\n\nNode.js با Express یا Fastify. Redis برای caching و rate limiting. پیاده‌سازی JWT validation. سیستم log ساختاریافته با ELK.\n\nمانیتورینگ با Prometheus و Grafana. Health checks برای میکروسرویس‌ها. مستندات API با Swagger. تست‌های بار برای ارزیابی عملکرد.',
  },
  {
    title: 'بهبود UX فرآیند ثبت‌نام اپلیکیشن',
    slug: 'ux-improvement-signup',
    categorySlug: 'ui-ux-design',
    skillSlugs: ['ux-design', 'figma', 'wireframing', 'prototyping'],
    budgetMin: 8_000_000,
    budgetMax: 20_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'SENIOR',
    status: 'EXPIRED',
    isFeatured: false,
    description: 'فرآیند ثبت‌نام اپلیکیشن ما نرخ ریزش بالایی دارد. نیاز به متخصص UX داریم که مشکل را تحلیل و راهکار ارائه دهد.\n\nتحلیل funnel ثبت‌نام فعلی و شناسایی نقاط ریزش. طراحی A/B test برای بهبود. ساده‌سازی فرم و کاهش مراحل ثبت‌نام.\n\nارائه وایرفریم‌های جدید و پروتوتایپ. توصیه‌های قابل اجرا بر اساس داده و best practices. هدف افزایش نرخ تکمیل ثبت‌نام حداقل ۲۰٪.',
  },
  {
    title: 'توسعه سیستم مدیریت محتوا اختصاصی',
    slug: 'custom-cms-development',
    categorySlug: 'web-development',
    skillSlugs: ['react', 'nodejs', 'typescript', 'postgresql'],
    budgetMin: 40_000_000,
    budgetMax: 100_000_000,
    duration: '2-3 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'توسعه CMS اختصاصی برای مدیریت محتوای چند سایتی. شامل: مدیریت صفحات، بلاگ، رسانه و منوها. ویرایشگر WYSIWYG و preview.\n\nفرانت‌اند با React و بک‌اند با Node.js. دیتابیس PostgreSQL. API RESTful. ویرایشگر محتوا با پشتیبانی از تصویر و ویدیو.\n\nسیستم نسخه‌بندی محتوا و scheduling. مدیریت کاربران و نقش‌ها. SEO tools داخلی. Multi-tenant architecture.',
  },
  {
    title: 'ساخت وب‌سرویس ارسال ایمیل انبوه',
    slug: 'bulk-email-service',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['nodejs', 'python', 'rest-api', 'postgresql'],
    budgetMin: 15_000_000,
    budgetMax: 40_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'ساخت وب‌سرویس برای ارسال ایمیل انبوه با قابلیت مدیریت لیست مخاطبین، قالب‌های ایمیل و گزارش‌گیری. باید از queue برای پردازش استفاده شود.\n\nNode.js با Bull/BullMQ برای queue. Redis برای مدیریت queue. اتصال به SMTP یا سرویس‌های ارسال ایمیل. Template engine برای قالب‌های ایمیل.\n\nAPI RESTful برای مدیریت. داشبورد ساده برای مشاهده وضعیت ارسال. پشتیبانی از ارسال زمان‌بندی شده و trigger-based. گزارش open/click rate.',
  },
  {
    title: 'طراحی سیستم نوتیفیکیشن بلادرنگ',
    slug: 'realtime-notification-system',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['nodejs', 'redis', 'rest-api'],
    budgetMin: 20_000_000,
    budgetMax: 50_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'طراحی و پیاده‌سازی سیستم نوتیفیکیشن بلادرنگ برای اپلیکیشن وب و موبایل. شامل push notification، in-app notification و ایمیل.\n\nWebSocket با Socket.io برای نوتیفیکیشن بلادرنگ. Redis Pub/Sub برای scaling. PostgreSQL برای ذخیره نوتیفیکیشن‌ها. Firebase Cloud Messaging برای push.\n\nسیستم preference برای کاربران. API برای مدیریت نوتیفیکیشن‌ها. پنل ادمین برای ارسال نوتیفیکیشن دستی. قابلیت segmenting کاربران.',
  },
  {
    title: 'توسعه اپلیکیشن رزرو آنلاین',
    slug: 'online-booking-app',
    categorySlug: 'mobile-app-development',
    skillSlugs: ['flutter', 'dart', 'nodejs'],
    budgetMin: 50_000_000,
    budgetMax: 120_000_000,
    duration: '2-3 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'توسعه اپلیکیشن رزرو آنلاین برای سالن‌های زیبایی و درمانی. مشتریان بتوانند وقت رزرو، سابقه رزروها را ببینند و اعلان دریافت کنند.\n\nفرانت‌اند Flutter و بک‌اند Node.js. تقویم هوشمند با نمایش زمان‌های آزاد. پرداخت آنلاین. Push notification. پنل مدیریت برای صاحبان سالن.\n\nسیستم امتیازدهی و نظر. Google Calendar integration. طراحی UI مدرن و کاربرپسند. پشتیبانی از چند شعبه.',
  },
  {
    title: 'ساخت داشبورد مانیتورینگ سرور',
    slug: 'server-monitoring-dashboard',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['linux', 'docker', 'python', 'postgresql'],
    budgetMin: 15_000_000,
    budgetMax: 40_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'ساخت داشبورد مانیتورینگ برای مشاهده وضعیت سرورها، Docker containers و سرویس‌ها. داشبورد باید بلادرنگ آپدیت شود و alert داشته باشد.\n\nفرانت‌اند با React و بک‌اند با Python یا Node.js. جمع‌آوری metrics با Prometheus exporter. ذخیره داده‌ها در PostgreSQL یا TimescaleDB.\n\nنمایش: CPU، RAM، Disk، Network و Docker container stats. سیستم alert با اعلان ایمیل و تلگرام. Graphهای قابل زوم و فیلتر زمانی.',
  },
  {
    title: 'بهینه‌سازی تصاویر و سرعت سایت',
    slug: 'image-optimization-speed',
    categorySlug: 'seo-digital-marketing',
    skillSlugs: ['seo', 'javascript', 'html-css'],
    budgetMin: 5_000_000,
    budgetMax: 12_000_000,
    duration: '1 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'EXPIRED',
    isFeatured: false,
    description: 'سایت ما تصاویر زیادی دارد و سرعت لود پایین است. نیاز به بهینه‌سازی تصاویر و بهبود سرعت کلی سایت.\n\nپیاده‌سازی lazy loading، responsive images و WebP/AVIF. راه‌اندازی CDN برای تصاویر. بهینه‌سازی CSS و JavaScript. تنظیم caching مناسب.\n\nهدف: بهبود PageSpeed score حداقل ۳۰ نمره و کاهش زمان لود اولیه به زیر ۳ ثانیه. ارائه گزارش قبل و بعد.',
  },
  {
    title: 'پیاده‌سازی احراز هویت دو مرحله‌ای',
    slug: 'two-factor-authentication',
    categorySlug: 'cybersecurity',
    skillSlugs: ['web-security', 'cryptography', 'nodejs'],
    budgetMin: 10_000_000,
    budgetMax: 25_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'پیاده‌سازی سیستم احراز هویت دو مرحله‌ای (2FA) برای پنل ادمین و پروفایل کاربران. شامل TOTP و SMS-based 2FA.\n\nNode.js با ادغام در سیستم احراز هویت موجود. تولید و validation کدهای TOTP (RFC 6238). ارسال کد SMS از طریق API. Recovery codes.\n\nپیاده‌سازی backup codes و روش بازیابی. UI برای تنظیم و مدیریت 2FA. Logging تمام تلاش‌های احراز هویت. تست‌های امنیتی.',
  },
  {
    title: 'طراحی پروفایل فریلنسرها در Figma',
    slug: 'freelancer-profile-figma',
    categorySlug: 'ui-ux-design',
    skillSlugs: ['figma', 'ui-design', 'ux-design', 'design-system'],
    budgetMin: 8_000_000,
    budgetMax: 20_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'طراحی صفحه پروفایل فریلنسر شامل: اطلاعات شخصی، مهارت‌ها، نمونه‌کارها، نظرات و آمار. طراحی باید Trust-building باشد.\n\nFigma با استفاده از Design System موجود. طراحی برای دسکتاپ و موبایل. انیمیشن‌های ظریف برای نمایش مهارت‌ها و نمونه‌کارها.\n\nطراحی بخش‌های: Hero، درباره من، مهارت‌ها، نمونه‌کارها (با فیلتر)، نظرات و آمار (درآمد، پروژه‌های تکمیل‌شده). Responsive.',
  },
  {
    title: 'توسعه سیستم مدیریت وظایف تیمی',
    slug: 'team-task-management',
    categorySlug: 'web-development',
    skillSlugs: ['react', 'typescript', 'nodejs', 'postgresql'],
    budgetMin: 35_000_000,
    budgetMax: 80_000_000,
    duration: '1-3 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'توسعه ابزار مدیریت وظایف تیمی شامل: Kanban board، لیست وظایف، تقویم، delegation و گزارش پیشرفت. مشابه Trello/Asana.\n\nفرانت‌اند React با drag-and-drop. بک‌اند Node.js با WebSocket برای آپدیت بلادرنگ. PostgreSQL. احراز هویت و RBAC.\n\nویژگی‌ها: ایجاد وظیفه، تخصیص به اعضا، deadline، فایل پیوست، کامنت، activity log و notification. داشبورد团队ی با نمودار پیشرفت.',
  },
  {
    title: 'ساخت ربات اسکرپر داده با Python',
    slug: 'python-web-scraper',
    categorySlug: 'ai-machine-learning',
    skillSlugs: ['python', 'sql', 'pandas'],
    budgetMin: 8_000_000,
    budgetMax: 20_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'ساخت ربات اسکرپر برای جمع‌آوری داده از چند وب‌سایت قیمت‌گذاری. داده‌ها باید تمیز شده و در دیتابیس ذخیره شوند.\n\nPython با Scrapy یا BeautifulSoup. مدیریت rate limiting و rotation. ذخیره در PostgreSQL. Scheduled execution با Celery یا cron.\n\nتمیزسازی و normalize داده‌ها. ساخت API ساده برای دسترسی به داده‌ها. گزارش خطاها و لاگ. قابلیت اضافه کردن سایت‌های جدید.',
  },
  {
    title: 'طراحی وب‌سایت نمونه‌کار شخصی',
    slug: 'personal-portfolio-website',
    categorySlug: 'ui-ux-design',
    skillSlugs: ['figma', 'ui-design', 'html-css', 'tailwind-css'],
    budgetMin: 5_000_000,
    budgetMax: 15_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'JUNIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'طراحی و پیاده‌سازی وب‌سایت نمونه‌کار شخصی برای یک عکاس حرفه‌ای. سایت باید تمیز و مینیمال باشد و روی تصاویر تمرکز داشته باشد.\n\nطراحی در Figma و کد با HTML/CSS/JS. گالری تصاویر با lightbox. بخش درباره من و تماس. انیمیشن‌های scroll ظریف.\n\nبهینه‌سازی تصاویر برای وب. ریسپانسیو. SEO basics. سرعت لود بالا. تم تیره و روشن.',
  },
  {
    title: 'پیاده‌سازی قابلیت جستجوی پیشرفته',
    slug: 'advanced-search-implementation',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['postgresql', 'graphql', 'rest-api'],
    budgetMin: 15_000_000,
    budgetMax: 35_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'پیاده‌سازی سیستم جستجوی پیشرفته برای marketplace شامل: full-text search، فیلتر ترکیبی، sort و autocomplete.\n\nPostgreSQL full-text search یا Meilisearch. GraphQL API برای query انعطاف‌پذیر. Index‌گذاری بهینه برای سرعت بالا.\n\nفیلترها: دسته‌بندی، قیمت، موقعیت، امتیاز و تاریخ. Sort بر اساس relevance، قیمت و تاریخ. Autocomplete با debouncing. Pagination cursor-based.',
  },
  {
    title: 'توسعه ماژول پرداخت در اپلیکیشن موبایل',
    slug: 'mobile-payment-module',
    categorySlug: 'mobile-app-development',
    skillSlugs: ['flutter', 'dart', 'nodejs'],
    budgetMin: 20_000_000,
    budgetMax: 50_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'SENIOR',
    status: 'COMPLETED',
    isFeatured: false,
    description: 'توسعه ماژول پرداخت برای اپلیکیشن Flutter شامل: کیف پول، تراکنش‌ها، پرداخت آنلاین و تاریخچه.\n\nفرانت‌اند Flutter با معماری Clean. بک‌اند Node.js API. اتصال به درگاه‌های پرداخت ایرانی. سیستم کیف پول با موجودی.\n\nنمایش تراکنش‌ها با فیلتر و sort. Push notification برای وضعیت تراکنش. امنیت بالا با encryption. تست واحد و یکپارچگی.',
  },
  {
    title: 'بهینه‌سازی سئوی محلی کسب‌وکار',
    slug: 'local-seo-optimization',
    categorySlug: 'seo-digital-marketing',
    skillSlugs: ['seo', 'google-analytics', 'google-ads', 'content-writing'],
    budgetMin: 10_000_000,
    budgetMax: 25_000_000,
    duration: '1-2 ماه',
    experienceLevel: 'MID_LEVEL',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'بهینه‌سازی سئوی محلی برای چند شعبه فروشگاه زنجیره‌ای. هدف افزایش visibility در جستجوی محلی گوگل و Google Maps.\n\nبهینه‌سازی Google Business Profile. Local citations و NAP consistency. تولید محتوای محلی. Schema.org برای local business.\n\nReview management strategy. Local link building. ردیابی رتبه کلمات کلیدی محلی. گزارش ماهانه پیشرفت. هدف حضور در 3-pack گوگل.',
  },
  {
    title: 'ساخت سیستم مدیریت فایل ابری',
    slug: 'cloud-file-management',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['nodejs', 'docker', 'rest-api', 'postgresql'],
    budgetMin: 30_000_000,
    budgetMax: 80_000_000,
    duration: '1-3 ماه',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'ساخت سیستم مدیریت فایل ابری مشابه Google Drive با قابلیت آپلود، دانلود، اشتراک‌گذاری و پیش‌نمایش فایل‌ها.\n\nNode.js با multer برای آپلود. ذخیره‌سازی S3-compatible. PostgreSQL برای متادیتا. Share با لینک و رمز عبور.\n\nپیش‌نمایش تصاویر و PDF. Drag & drop آپلود. Folder structure. Search و filter. Quota management. Versioning ساده.',
  },
  {
    title: 'طراحی و توسعه پورتفولیو آنلاین',
    slug: 'online-portfolio-development',
    categorySlug: 'web-development',
    skillSlugs: ['nextjs', 'tailwind-css', 'typescript'],
    budgetMin: 8_000_000,
    budgetMax: 20_000_000,
    duration: '1-2 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'COMPLETED',
    isFeatured: false,
    description: 'طراحی و توسعه وب‌سایت پورتفولیو آنلاین برای یک استودیو طراحی. سایت باید نمایش‌دهنده نمونه‌کارها و خدمات باشد.\n\nNext.js با Tailwind CSS. گالری نمونه‌کارها با فیلتر دسته‌بندی. صفحه خدمات و تماس. انیمیشن‌های scroll. CMS ساده.\n\nبهینه‌سازی SEO. ریسپانسیو. سرعت لود بالا. Dark mode. Blog section ساده.',
  },
  {
    title: 'پیاده‌سازی WebSocket برای چت آنلاین',
    slug: 'websocket-online-chat',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['nodejs', 'redis', 'rest-api', 'typescript'],
    budgetMin: 20_000_000,
    budgetMax: 50_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'SENIOR',
    status: 'PUBLISHED',
    isFeatured: false,
    description: 'پیاده‌سازی سیستم چت آنلاین با WebSocket برای پلتفرم فریلنسری. شامل چت خصوصی و گروهی با قابلیت ارسال فایل.\n\nSocket.io با Redis adapter برای scaling. پیام‌های متنی و فایلی. Typing indicator و read receipts. ذخیره تاریخچه چت.\n\nAPI RESTful برای مدیریت مکالمات. Notification برای پیام‌های جدید. آنلاین/آفلاین status. Search در پیام‌ها. Flutter client SDK.',
  },
  {
    title: 'توسعه سیستم امتیازدهی و بررسی',
    slug: 'rating-review-system',
    categorySlug: 'web-development',
    skillSlugs: ['react', 'typescript', 'nodejs', 'postgresql'],
    budgetMin: 15_000_000,
    budgetMax: 35_000_000,
    duration: '2-4 هفته',
    experienceLevel: 'MID_LEVEL',
    status: 'COMPLETED',
    isFeatured: false,
    description: 'توسعه سیستم امتیازدهی و بررسی برای marketplace. شامل: امتیاز ستاره‌ای، نظر متنی، فیلتر و مرتب‌سازی.\n\nفرانت‌اند React components قابل استفاده مجدد. بک‌اند Node.js API. محاسبه امتیاز میانگین. Anti-spam و moderation.\n\nویژگی‌ها: امتیازدهی چند معیاره، نظر متنی، پاسخ به نظر، report و moderation. Widget نمایش امتیاز. SEO-friendly markup.',
  },
  {
    title: 'ساخت ابزار تولید کد با هوش مصنوعی',
    slug: 'ai-code-generation-tool',
    categorySlug: 'ai-machine-learning',
    skillSlugs: ['python', 'llm', 'openai-api', 'react', 'typescript'],
    budgetMin: 50_000_000,
    budgetMax: 150_000_000,
    duration: '2-4 ماه',
    experienceLevel: 'EXPERT',
    status: 'IN_PROGRESS',
    isFeatured: true,
    description: 'ساخت ابزار تولید کد با هوش مصنوعی که بتواند بر اساس توضیحات فارسی، کد تولید کند. شامل ویرایشگر کد با syntax highlighting.\n\nبک‌اند Python با OpenAI API یا مدل‌های open-source. RAG برای context-aware generation. فرانت‌اند React با Monaco Editor.\n\nویژگی‌ها: تولید کد از توضیحات طبیعی، توضیح کد، refactor و debug. تاریخچه تولیدها. Template‌های آماده. Share و export. پشتیبانی از چند زبان برنامه‌نویسی.',
  },
];

// ─── Blog Post Data ────────────────────────────────────────────────────────

const BLOG_POSTS = [
  {
    title: 'چگونه پروژه برنامه نویسی بگیریم؟',
    slug: 'how-to-get-programming-projects',
    content: `دریافت پروژه‌های برنامه‌نویسی یکی از مهم‌ترین چالش‌های فریلنسرهاست. برای موفقیت در این مسیر، ابتدا باید یک پورتفولیو قوی بسازید که نمونه کارهای شما را به بهترین شکل نمایش دهد. پروژه‌های شخصی، مشارکت در پروژه‌های open-source و کارهای انجام‌شده برای مشتریان قبلی همگی می‌توانند بخشی از پورتفولیو شما باشند.

第二، یک پروفایل کامل در پلتفرم‌های فریلنسری ایجاد کنید. displayName واقعی، عکس حرفه‌ای، توضیحات دقیق از مهارت‌ها و تجربیات و نرخ مناسب برای خدمات خود را مشخص کنید. مشتریان به فریلنسرهایی اعتماد می‌کنند که پروفایل‌های کامل و حرفه‌ای دارند.

第三، پیشنهادهای (proposal) شخصی‌سازی شده بنویسید. هرگز یک متن کپی‌پيست برای همه پروژه‌ها نفرستید. مشتری را بشناسید، نیازهایش را درک کنید و توضیح دهید که چگونه مهارت‌های شما می‌تواند مشکلش را حل کند. زمان‌بندی واقع‌بینانه و قیمت منصفانه ارائه دهید.

در نهایت، شبکه‌سازی فعال داشته باشید. در انجمن‌های تخصصی حضور یابید، در کنفرانس‌ها شرکت کنید و با دیگر فریلنسرها و مشتریان بالقوه ارتباط برقرار کنید. بسیاری از پروژه‌های خوب از طریق معرفی و شبکه‌سازی به دست می‌آیند.`,
  },
  {
    title: 'قیمت پروژه React چطور محاسبه می‌شود؟',
    slug: 'how-to-price-react-projects',
    content: `قیمت‌گذاری پروژه‌های React یکی از سوالات متداول فریلنسرهاست. عوامل متعددی در تعیین قیمت یک پروژه React نقش دارند: پیچیدگی پروژه، تعداد صفحات و کامپوننت‌ها، نیاز به API integration، میزان سفارشی‌سازی و تجربه فریلنسر.

برای پروژه‌های ساده مانند لندینگ پیج یا وب‌سایت شخصی، قیمت‌ها معمولا از ۵ میلیون تومان شروع می‌شوند. پروژه‌های متوسط مانند داشبورد مدیریتی یا فروشگاه آنلاین ساده، بین ۱۵ تا ۵۰ میلیون تومان قیمت دارند. پروژه‌های پیچیده مانند SaaS یا اپلیکیشن‌های بزرگ می‌توانند از ۵۰ میلیون تا صدها میلیون تومان هزینه داشته باشند.

دو روش اصلی قیمت‌گذاری وجود دارد: قیمت ثابت و قیمت ساعتی. برای پروژه‌هایی که محدوده کار مشخص است، قیمت ثابت مناسب‌تر است. برای پروژه‌هایی که ممکن است تغییر کنند، قیمت ساعتی امن‌تر است. میانگین نرخ ساعتی یک توسعه‌دهنده React در ایران بین ۵۰۰ هزار تا ۳ میلیون تومان است.

نکته مهم: همیشه قبل از شروع، محدوده کار (scope) را به صورت مکتوب مشخص کنید. تغییرات خارج از scope باید به عنوان تغییر (change request) محاسبه شود. این کار از سوءتفاهم و اختلاف جلوگیری می‌کند.`,
  },
  {
    title: 'چگونه برنامه نویس فریلنسر مناسب انتخاب کنیم؟',
    slug: 'how-to-choose-freelancer-developer',
    content: `انتخاب برنامه‌نویس فریلنسر مناسب برای پروژه‌تان، تاثیر مستقیمی بر موفقیت پروژه دارد. اولین قدم، تعریف دقیق نیازهای پروژه است. قبل از جستجوی فریلنسر، باید بدانید دقیقا چه چیزی می‌خواهید: چه تکنولوژی‌هایی نیاز است، چه functionalities باید پیاده‌سازی شود و بودجه شما چقدر است.

در بررسی پروفایل فریلنسرها، به چند نکته توجه کنید: نمونه کارهای مرتبط با پروژه شما، امتیاز و نظرات مشتریان قبلی، میزان پاسخگویی و نرخ تکمیل پروژه‌ها. یک فریلنسر با ۵ سال تجربه و ۵۰ پروژه تکمیل‌شده، معمولا قابل اعتمادتر از کسی است که تازه شروع کرده.

مصاحبه فنی برگزار کنید. سوالاتی درباره معماری پروژه، ابزارها و روش‌های کاری بپرسید. این مصاحبه به شما کمک می‌کند تا سطح دانش فریلنسر را ارزیابی کنید و مطمئن شوید که communication skills مناسبی دارد.

قرارداد کتبی بنویسید. تمام جزئیات شامل محدوده کار، زمان‌بندی، قیمت، شرایط پرداخت و مالکیت intellectual property باید در قرارداد ذکر شود. پرداخت را به milestone‌ها تقسیم کنید تا ریسک کاهش یابد.`,
  },
  {
    title: 'React یا Next.js برای پروژه شما؟',
    slug: 'react-vs-nextjs-for-your-project',
    content: `انتخاب بین React و Next.js یکی از تصمیمات مهم در شروع پروژه وب است. React یک کتابخانه JavaScript برای ساخت رابط کاربری است، در حالی که Next.js یک فریمورک بر پایه React است که قابلیت‌های اضافی مانند SSR، SSG، routing و بهینه‌سازی خودکار را فراهم می‌کند.

اگر پروژه شما یک وب‌اپلیکیشن پیچیده با نیاز به SEO بالا است، Next.js انتخاب بهتری است. ویژگی‌های SSR و SSG به بهبود رتبه در موتورهای جستجو کمک می‌کنند. همچنین قابلیت‌هایی مانند Image Optimization، API Routes و Middleware Development در Next.js، توسعه را سریع‌تر می‌کنند.

React pure برای پروژه‌هایی مناسب است که SEO اهمیت کمتری دارد، مانند پنل ادمین، داشبورد داخلی یا اپلیکیشن‌هایی که بعدا به عنوان پکیج npm یا desktop app استفاده می‌شوند. در این موارد، سادگی React و آزادی بیشتر در انتخاب ابزارها مزیت است.

در عمل، بسیاری از تیم‌ها از Next.js به عنوان فریمورک پیش‌فرض استفاده می‌کنند، زیرا حتی اگر SSR در ابتدا نیاز نباشد، امکان آن در آینده وجود دارد. با این حال، برای پروژه‌های ساده یا زمانی که کنترل کامل خواسته می‌شود، React ممکن است مناسب‌تر باشد.`,
  },
  {
    title: 'چطور یک پروژه فریلنسری حرفه‌ای تعریف کنیم؟',
    slug: 'how-to-define-professional-freelance-project',
    content: `تعریف حرفه‌ای پروژه فریلنسری اولین قدم برای دریافت پیشنهادهای باکیفیت است. یک پروژه خوب تعریف‌شده، فریلنسرهای مناسب را جذب می‌کند و سوءتفاهم را کاهش می‌دهد.

عنوان پروژه باید واضح و مختصر باشد. به جای «نیاز به برنامه‌نویس»، بنویسید «توسعه فروشگاه آنلاین با React و Node.js». عنوان باید تکنولوژی و نوع پروژه را مشخص کند. توضیحات پروژه باید شامل: معرفی کوتاه کسب‌وکار، توضیح دقیق آنچه نیاز است، تکنولوژی‌های مورد نظر و دلیل انتخاب آنها، و محدودیت‌ها یا نیازمندی‌های خاص.

بودجه و زمان‌بندی واقع‌بینانه تعیین کنید. بودجه خیلی پایین فریلنسرهای حرفه‌ای را فراری می‌دهد و بودجه خیلی بالا انتظارات غیرواقع‌ای ایجاد می‌کند. تحقیق کنید که قیمت بازار برای پروژه مشابه چقدر است. زمان‌بندی را با در نظر گرفتن buffer برای تغییرات احتمالی تعیین کنید.

ویژگی‌های پروژه را به must-have و nice-to-have تقسیم کنید. این کار به فریلنسر کمک می‌کند تا پیشنهاد واقع‌بینانه‌تری بدهد و به شما امکان می‌دهد در صورت محدودیت بودجه، scope را مدیریت کنید.`,
  },
  {
    title: 'چطور رزومه فریلنسری بهتری بسازیم؟',
    slug: 'how-to-build-better-freelance-resume',
    content: `رزومه فریلنسری با رزومه سنتی تفاوت‌های اساسی دارد. در حالی که رزومه سنتی روی سوابق کاری تمرکز دارد، رزومه فریلنسری باید روی مهارت‌ها، نمونه کارها و نتایج قابل اندازه‌گیری متمرکز باشد.

پورتفولیو قوی مهم‌ترین بخش رزومه فریلنسری شماست. هر پروژه را با توضیح مشکل، راه‌حل شما و نتایج قابل اندازه‌گیری (مثلا افزایش ۳۰٪ سرعت، کاهش ۵۰٪ هزینه) ارائه دهید. لینک لایو پروژه‌ها، کد GitHub و ویدیوهای دمو بسیار ارزشمند هستند.

بخش مهارت‌ها را هوشمندانه بنویسید. به جای لیست کردن همه ابزارهایی که بلدید، روی مهارت‌هایی تمرکز کنید که با نوع پروژه‌های مورد نظرتان مرتبط هستند. هر مهارت را با سطح تسلط (مبتدی، متوسط، پیشرفته، حرفه‌ای) مشخص کنید. endorsements از مشتریان قبلی اعتبار بالایی دارند.

نظرات و امتیازات مشتریان قبلی بهترین social proof هستند. از مشتریان راضی بخواهید نظر بنویسند. به هر نظر اهمیت بدهید و به صورت حرفه‌ای پاسخ دهید. میانگین امتیاز بالای ۴.۵ از ۵ تاثیر قابل توجهی بر تصمیم مشتریان جدید دارد.`,
  },
  {
    title: 'بهترین روش قیمت‌گذاری پروژه فرانت‌اند',
    slug: 'best-pricing-method-frontend-projects',
    content: `قیمت‌گذاری پروژه‌های فرانت‌اند نیازمند درک عمیق از عوامل موثر بر هزینه است. برخلاف بک‌اند که پیچیدگی‌های پنهان بیشتری دارد، فرانت‌اند معمولا قابل تخمین‌تر است، اما همچنان عوامل متعددی باید در نظر گرفته شوند.

روش Value-based pricing یکی از بهترین روش‌هاست. در این روش، به جای محاسبه ساعت کار، ارزشی که پروژه برای مشتری ایجاد می‌کند را در نظر می‌گیرید. اگر طراحی جدید وب‌سایت مشتری می‌تواند نرخ تبدیل را ۲۰٪ افزایش دهد و درآمد سالانه ۱ میلیارد تومانی داشته باشد، قیمت ۵۰ میلیون تومان برای طراحی کاملا منطقی است.

معمولا قیمت بر اساس پیچیدگی تعیین می‌شود. عوامل موثر شامل: تعداد و پیچیدگی صفحات، نیاز به responsive design، میزان انیمیشن و interactivity، پیچیدگی state management، نیاز به SEO و بهینه‌سازی performance، و میزان integration با API های موجود.

نکته عملی: همیشه پیشنهاد خود را با breakdown قیمت ارائه دهید. مثلا طراحی UI: X، پیاده‌سازی فرانت‌اند: Y، تست و بهینه‌سازی: Z. این شفافیت به مشتری اطمینان می‌دهد و مذاکره را راحت‌تر می‌کند. همچنین تغییرات آتی را به وضوح در قرارداد مشخص کنید.`,
  },
  {
    title: 'چطور در پروژه‌های دورکاری موفق‌تر باشیم؟',
    slug: 'how-to-succeed-in-remote-projects',
    content: `دورکاری تبدیل به بخش جدایی‌ناپذیر کار فریلنسری شده است. برای موفقیت در پروژه‌های دورکاری، نیاز به مجموعه‌ای از مهارت‌های نرم و ابزارهای مناسب دارید.

ارتباط موثر مهم‌ترین عامل موفقیت در دورکاری است. گزارش‌های منظم (هفتگی یا دوهفته‌ای) ارسال کنید، حتی اگر مشتری درخواست نکرده باشد. از ابزارهای همکاری مانند Slack، Notion یا Trello استفاده کنید. در صورت بروز مشکل، فورا اطلاع دهید. مشتریان ترجیح می‌دهند زودتر از deadline مطلع شوند.

مدیریت زمان و تمرکز کلیدی هستند. یک محیط کار اختصاصی در خانه ایجاد کنید. تکنیک‌هایی مانند Pomodoro را امتحان کنید. مرزهای واضح بین ساعت کار و زندگی شخصی تعیین کنید. Overcommitment یکی از بزرگترین اشتباهات فریلنسرهاست؛ فقط به اندازه‌ای پروژه بگیرید که بتوانید با کیفیت تحویل دهید.

تحویل به موقع و کیفیت کار، بهترین بازاریابی شماست. مشتریان راضی نه تنها پروژه‌های بعدی را به شما می‌سپارند، بلکه شما را به دیگران هم معرفی می‌کنند. در پروژه‌های دورکاری، اعتمادسازی از طریق عملکرد ثابت و قابل پیش‌بینی صورت می‌گیرد.`,
  },
];

// ─── Service Listing Data ──────────────────────────────────────────────────

const SERVICE_LISTINGS = [
  {
    freelancerIdx: 0,
    title: 'طراحی و توسعه وب‌سایت با Next.js',
    slug: 'nextjs-website-development',
    categorySlug: 'web-development',
    skillSlugs: ['nextjs', 'typescript', 'tailwind-css'],
    priceRial: 25_000_000,
    deliveryDays: 14,
    description: 'طراحی و توسعه وب‌سایت حرفه‌ای با Next.js، TypeScript و Tailwind CSS. شامل طراحی ریسپانسیو، بهینه‌سازی SEO و deploy. مناسب برای کسب‌وکارها و استارتاپ‌ها.',
  },
  {
    freelancerIdx: 1,
    title: 'طراحی UI/UX اپلیکیشن موبایل',
    slug: 'mobile-app-ui-ux-design',
    categorySlug: 'ui-ux-design',
    skillSlugs: ['figma', 'ui-design', 'ux-design'],
    priceRial: 15_000_000,
    deliveryDays: 10,
    description: 'طراحی کامل UI/UX اپلیکیشن موبایل در Figma. شامل wireframe، high-fidelity design، prototyping و design system. مناسب iOS و Android.',
  },
  {
    freelancerIdx: 2,
    title: 'توسعه REST API با Node.js',
    slug: 'nodejs-rest-api-development',
    categorySlug: 'backend-infrastructure',
    skillSlugs: ['nodejs', 'rest-api', 'postgresql'],
    priceRial: 20_000_000,
    deliveryDays: 14,
    description: 'توسعه API حرفه‌ای با Node.js و Express. شامل احراز هویت JWT، validation، مستندسازی Swagger و تست. دیتابیس PostgreSQL.',
  },
  {
    freelancerIdx: 3,
    title: 'توسعه فول‌استک اپلیکیشن وب',
    slug: 'fullstack-web-application',
    categorySlug: 'web-development',
    skillSlugs: ['react', 'nestjs', 'typescript', 'postgresql'],
    priceRial: 50_000_000,
    deliveryDays: 30,
    description: 'توسعه کامل اپلیکیشن وب فرانت‌اند و بک‌اند. React + NestJS + PostgreSQL. شامل احراز هویت، CRUD، deploy و تست.',
  },
  {
    freelancerIdx: 4,
    title: 'طراحی و راه‌اندازی فروشگاه وردپرسی',
    slug: 'wordpress-store-setup',
    categorySlug: 'web-development',
    skillSlugs: ['wordpress', 'php'],
    priceRial: 12_000_000,
    deliveryDays: 7,
    description: 'طراحی و راه‌اندازی فروشگاه آنلاین با WordPress و WooCommerce. شامل نصب، تنظیمات، افزونه‌های ضروری و آموزش.',
  },
  {
    freelancerIdx: 5,
    title: 'ساخت موشن گرافیک و لوگو انیمیشن',
    slug: 'motion-graphics-logo-animation',
    categorySlug: 'graphics-animation',
    skillSlugs: ['after-effects', 'adobe-illustrator'],
    priceRial: 8_000_000,
    deliveryDays: 5,
    description: 'ساخت موشن گرافیک و لوگو انیمیشن حرفه‌ای با After Effects. مناسب برای تبلیغات، اینترو ویدیو و شبکه‌های اجتماعی.',
  },
  {
    freelancerIdx: 6,
    title: 'ساخت اپلیکیشن موبایل با Flutter',
    slug: 'flutter-mobile-app',
    categorySlug: 'mobile-app-development',
    skillSlugs: ['flutter', 'dart'],
    priceRial: 40_000_000,
    deliveryDays: 21,
    description: 'ساخت اپلیکیشن موبایل کراس‌پلتفرم با Flutter. شامل UI طراحی‌شده، اتصال به API و publish در Google Play و App Store.',
  },
  {
    freelancerIdx: 7,
    title: 'راه‌اندازی CI/CD و Docker',
    slug: 'cicd-docker-setup',
    categorySlug: 'testing-devops',
    skillSlugs: ['docker', 'github-actions', 'ci-cd'],
    priceRial: 15_000_000,
    deliveryDays: 7,
    description: 'راه‌اندازی کامل CI/CD Pipeline با GitHub Actions و Docker. شامل Dockerfile، docker-compose، تست‌های خودکار و deployment خودکار.',
  },
  {
    freelancerIdx: 8,
    title: 'بهینه‌سازی SEO سایت',
    slug: 'website-seo-optimization',
    categorySlug: 'seo-digital-marketing',
    skillSlugs: ['seo', 'google-analytics'],
    priceRial: 10_000_000,
    deliveryDays: 14,
    description: 'بهینه‌سازی کامل SEO سایت شامل Technical SEO، On-page SEO و تحلیل رقبا. ارائه گزارش و план اقدام.',
  },
  {
    freelancerIdx: 9,
    title: 'تحلیل داده و ساخت داشبورد',
    slug: 'data-analysis-dashboard',
    categorySlug: 'data-analytics',
    skillSlugs: ['python', 'data-analysis', 'power-bi'],
    priceRial: 18_000_000,
    deliveryDays: 10,
    description: 'تحلیل داده با Python و ساخت داشبورد تعاملی با Power BI. شامل ETL، visualization و گزارش‌های تحلیلی.',
  },
];

// ─── Proposal Cover Letters ────────────────────────────────────────────────

const PROPOSAL_TEMPLATES = [
  'سلام. من بیش از {years} سال تجربه در این حوزه دارم و می‌توانم پروژه شما را با کیفیت بالا و در زمان مقرر تحویل دهم. نمونه کارهای مرتبط در پورتفولیو من موجود است.',
  'با سلام و احترام. با بررسی توضیحات پروژه، متوجه شدم که دقیقا در حوزه تخصص من است. من قبلا پروژه‌های مشابهی انجام داده‌ام و می‌توانم از روز اول نتیجه‌بخش باشم.',
  'سلام وقت بخیر. من یک {level} در این حوزه هستم و پروژه شما را با دقت مطالعه کردم. پیشنهاد من شامل تحویل phased است تا بتوانید در هر مرحله بازخورد بدهید.',
  'با درود. من تخصص ویژه‌ای در این نوع پروژه‌ها دارم. کد تمیز، مستندسازی کامل و پشتیبانی پس از تحویل از ویژگی‌های کار من است. آماده شروع فوری هستم.',
  'سلام. من این پروژه را با علاقه مطالعه کردم و مطمئنم که می‌توانم بهترین نتیجه را ارائه دهم. تجربه قبلی من در پروژه‌های مشابه به من کمک می‌کند تا سریع و باکیفیت کار کنم.',
  'با سلام. من یک تیم {size} نفره متخصص دارم و می‌توانیم پروژه شما را سریع‌تر و با کیفیت بالاتر انجام دهیم. communication منظم و گزارش‌دهی هفتگی جزو تعهدات ماست.',
  'سلام. خواندن توضیحات پروژه شما برام جذاب بود. من دقیقا همین نوع کار رو قبلا انجام دادم و می‌تونم با توجه به نیازهای خاص شما، بهترین راه‌حل رو ارائه بدم.',
  'وقت بخیر. من در این حوزه بیش از {years} پروژه موفق داشته‌ام. تمرکز من روی کیفیت کد، تست‌نویسی و تحویل به موقع است. قیمت پیشنهادی من منصفانه و رقابتی است.',
];

function generateCoverLetter(template: string): string {
  return template
    .replace('{years}', String(rand(3, 8)))
    .replace('{level}', pick(['توسعه‌دهنده ارشد', 'متخصص', 'حرفه‌ای']))
    .replace('{size}', String(rand(2, 5)));
}

// ─── Review Comments ───────────────────────────────────────────────────────

const REVIEW_COMMENTS = [
  'کار بسیار حرفه‌ای و باکیفیت بود. تحویل به موقع و communication عالی. حتما دوباره همکاری می‌کنیم.',
  'کیفیت کار فراتر از انتظار بود. فریلنسر بسیار مسلط بود و پیشنهادهای بهتری هم داد. توصیه می‌کنم.',
  'پروژه با موفقیت و در زمان مقرر تحویل داده شد. کد تمیز و مستندسازی شده بود. رضایت کامل.',
  'تجربه همکاری بسیار خوبی بود. فریلنسر responsive بود و تغییرات درخواستی را سریع اعمال کرد.',
  'کار خوب بود اما کمی تاخیر در تحویل داشت. کیفیت نهایی رضایت‌بخش بود.',
  'فریلنسر بسیار حرفه‌ای و متعهد بود. حتی بعد از تحویل پروژه برای رفع باگ‌ها همراهی کرد. عالی.',
  'نتیجه کار فوق‌العاده بود. طراحی زیبا، کد بهینه و مستندسازی کامل. از همکاری بسیار راضی هستم.',
  'پروژه طبق مشخصات تحویل داده شد. communication خوب و قیمت منصفانه. بدون مشکل خاصی پیش رفت.',
  'فریلنسر مهارت بالایی داشت و کار را با دقت انجام داد. تنها نکته، بهتر بود گزارش‌دهی منظم‌تری داشته باشد.',
  'همکاری بسیار مثمرثمر بود. پروژه پیچیده بود اما با مدیریت خوب فریلنسر به نتیجه رسید. تشکر.',
  'کیفیت کار عالی بود. فریلنسر تسلط کامل به تکنولوژی‌های مورد نیاز داشت. پیشنهاد می‌شود.',
  'تحویل زودتر از موعد! کیفیت بالا و قیمت مناسب. یکی از بهترین فریلنسرهایی بود که باشان کار کردم.',
  'کار خوب و حرفه‌ای. فریلنسر به جزئیات توجه زیادی داشت. نتیجه نهایی بسیار رضایت‌بخش بود.',
  'تجربه مثبت. communication خوب و کار باکیفیت. کوچک مشکلاتی بود که سریع رفع شد.',
  'پروژه به بهترین شکل تحویل داده شد. فریلنسر پیشنهادهای ارزشمندی برای بهبود داشت. ممنون.',
];

// ─── Conversation Messages ─────────────────────────────────────────────────

const CONVERSATION_STARTERS = [
  'سلام. پروژه شما را دیدم و خیلی به من interesant بود. می‌خواستم چند سوال بپرسم.',
  'سلام وقت بخیر. در مورد پروژه‌ای که منتشر کردید تماس گرفتم.',
  'با سلام. ممنون از فرصت همکاری. چند نکته technical می‌خواستم بپرسم.',
  'سلام. پیشنهاد من رو دیدید؟ آماده‌ام بیشتر توضیح بدم.',
  'با درود. درباره پروژه طراحی داشبورد سوال داشتم.',
];

const CONVERSATION_REPLIES = [
  'سلام. بفرمایید، خوشحال می‌شوم جواب بدهم.',
  'سلام وقت بخیر. بله، لطفا سوالاتتان را بپرسید.',
  'با سلام. ممنون از پیگیری. آماده پاسخگویی هستم.',
  'سلام. بله حتما. پروژه هنوز باز هست و پیشنهادها در حال بررسی است.',
  'سلام. ممنون از تماس. چه سوالی دارید؟',
];

const CONVERSATION_FOLLOWS = [
  'آیا امکان داره deadline رو یک هفته تمدید کنید؟ پروژه کمی پیچیده‌تر از چیزیه که توضیح دادید.',
  'تکنولوژی بک‌اند مشخص هست یا من می‌تونم طبق تجربه‌ام انتخاب کنم؟',
  'طرح پرداخت چطور هست؟ آیا milestone-based پرداخت می‌کنید؟',
  'آیا فایل‌های طراحی Figma آماده هست یا اون هم جزو کار من هست؟',
  'بودجه قابل مذاکره هست؟ من می‌تونم با این قیمت کار باکیفیت‌تری تحویل بدم.',
];

const CONVERSATION_CLOSERS = [
  'بسیار خب. ممنون از توضیحات. پیشنهاد نهایی رو ارسال می‌کنم.',
  'عالی. فکر می‌کنم بتونیم همکاری خوبی داشته باشیم. منتظر جواب هستم.',
  'ممنون. اطلاعات کافی دارم. بهترین پیشنهادم رو آماده می‌کنم.',
  'خیلی ممنون. من بررسی می‌کنم و تا فردا جواب می‌دم.',
  'عالی. من با تیمم مشورت می‌کنم و نتیجه رو اطلاع می‌دم.',
];

// ─── Main Seed Function ────────────────────────────────────────────────────

export async function seedComprehensiveData() {
  console.log('\n📊 Starting comprehensive seed...');

  // Check if comprehensive seed data already exists
  const existingUsers = await db.user.count();
  if (existingUsers >= 30) {
    console.log(`✅ ${existingUsers} users already exist. Skipping comprehensive seed.`);
    return;
  }

  try {
    const passwordHash = await hash('devjoo123', 10);

    // ═══════════════════════════════════════════════════════════════════
    // 1. CREATE ROLES
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📦 Creating roles...');

    const roleData = [
      { name: USER_ROLES.FREELANCER },
      { name: USER_ROLES.EMPLOYER },
      { name: USER_ROLES.ADMIN },
    ];

    const roleMap: Record<string, string> = {};
    for (const r of roleData) {
      const existing = await db.role.findUnique({ where: { name: r.name } });
      if (existing) {
        roleMap[r.name] = existing.id;
      } else {
        const role = await db.role.create({ data: r });
        roleMap[r.name] = role.id;
      }
      console.log(`  ✓ Role: ${r.name}`);
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. CREATE USERS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n👥 Creating users...');

    const freelancerUsers: { id: string; phone: string; displayName: string; email: string }[] = [];
    const employerUsers: { id: string; phone: string; displayName: string; email: string }[] = [];
    const adminUsers: { id: string; phone: string; displayName: string; email: string }[] = [];

    // Create freelancers
    for (let i = 0; i < FREELANCER_NAMES.length; i++) {
      const phone = `091210000${String(i + 1).padStart(2, '0')}`;
      const displayName = FREELANCER_NAMES[i];
      const email = displayName.replace(/\s/g, '') + '@devjoo.local';

      const user = await db.user.create({
        data: {
          phone,
          email,
          displayName,
          passwordHash,
          isActive: true,
        },
      });
      freelancerUsers.push({ id: user.id, phone, displayName, email });
    }
    console.log(`  ✓ Created ${freelancerUsers.length} freelancers`);

    // Create employers
    for (let i = 0; i < EMPLOYER_NAMES.length; i++) {
      const phone = `091220000${String(i + 1).padStart(2, '0')}`;
      const displayName = EMPLOYER_NAMES[i];
      const email = displayName.replace(/\s/g, '') + '@devjoo.local';

      const user = await db.user.create({
        data: {
          phone,
          email,
          displayName,
          passwordHash,
          isActive: true,
        },
      });
      employerUsers.push({ id: user.id, phone, displayName, email });
    }
    console.log(`  ✓ Created ${employerUsers.length} employers`);

    // Create admins
    for (let i = 0; i < ADMIN_NAMES.length; i++) {
      const phone = `091230000${String(i + 1).padStart(2, '0')}`;
      const displayName = ADMIN_NAMES[i];
      const email = displayName.replace(/\s/g, '') + '@devjoo.local';

      const user = await db.user.create({
        data: {
          phone,
          email,
          displayName,
          passwordHash,
          isActive: true,
        },
      });
      adminUsers.push({ id: user.id, phone, displayName, email });
    }
    console.log(`  ✓ Created ${adminUsers.length} admins`);

    // ═══════════════════════════════════════════════════════════════════
    // 3. ASSIGN USER ROLES
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n🔑 Assigning user roles...');

    const userRolesData = [
      ...freelancerUsers.map((u) => ({ userId: u.id, roleId: roleMap[USER_ROLES.FREELANCER] })),
      ...employerUsers.map((u) => ({ userId: u.id, roleId: roleMap[USER_ROLES.EMPLOYER] })),
      ...adminUsers.map((u) => ({ userId: u.id, roleId: roleMap[USER_ROLES.ADMIN] })),
    ];

    await db.userRole.createMany({ data: userRolesData });
    console.log(`  ✓ Assigned ${userRolesData.length} user roles`);

    // ═══════════════════════════════════════════════════════════════════
    // 4. CREATE PROFILES + FREELANCER/EMPLOYER PROFILES
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📄 Creating profiles...');

    const freelancerProfiles: { profileId: string; userId: string }[] = [];
    const employerProfiles: { profileId: string; userId: string }[] = [];

    // Freelancer profiles
    for (let i = 0; i < freelancerUsers.length; i++) {
      const u = freelancerUsers[i];
      const profile = await db.profile.create({
        data: {
          userId: u.id,
          displayName: u.displayName,
          bio: FREELANCER_BIOS[i],
          city: pick(['تهران', 'اصفهان', 'شیراز', 'تبریز', 'مشهد', 'اهواز', 'کرج', 'قم']),
        },
      });

      const availability = i < 17 ? AVAILABILITY.AVAILABLE : pick([AVAILABILITY.BUSY, AVAILABILITY.LIMITED]);

      await db.freelancerProfile.create({
        data: {
          profileId: profile.id,
          headline: FREELANCER_HEADLINES[i],
          bio: FREELANCER_BIOS[i],
          hourlyRateRial: rand(500_000, 3_000_000),
          availability,
          hoursPerWeek: rand(20, 44),
          experienceLevel: pick([
            EXPERIENCE_LEVEL.MID_LEVEL,
            EXPERIENCE_LEVEL.SENIOR,
            EXPERIENCE_LEVEL.EXPERT,
          ]),
          totalCompletedProjects: rand(0, 50),
          totalHires: rand(0, 30),
          responseRate: randFloat(70, 99),
          averageRating: randFloat(3.5, 5.0),
        },
      });

      freelancerProfiles.push({ profileId: profile.id, userId: u.id });
    }
    console.log(`  ✓ Created ${freelancerProfiles.length} freelancer profiles`);

    // Employer profiles
    for (let i = 0; i < employerUsers.length; i++) {
      const u = employerUsers[i];
      const profile = await db.profile.create({
        data: {
          userId: u.id,
          displayName: u.displayName,
          city: pick(['تهران', 'اصفهان', 'شیراز', 'تبریز']),
        },
      });

      const employeeCount = EMPLOYER_COMPANY_SIZES[i] === 'MICRO' ? rand(2, 10) :
        EMPLOYER_COMPANY_SIZES[i] === 'SMALL' ? rand(11, 50) : rand(51, 200);

      await db.employerProfile.create({
        data: {
          profileId: profile.id,
          companyName: u.displayName,
          companySize: EMPLOYER_COMPANY_SIZES[i],
          industry: pick(['فناوری اطلاعات', 'فین‌تک', 'کسب‌وکار دیجیتال', 'طراحی و تبلیغات', 'تجارت الکترونیک', 'آموزش']),
          totalPosted: rand(3, 20),
          totalHired: rand(2, 15),
          hireRate: randFloat(50, 95),
          responseRate: randFloat(60, 95),
          averageResponseTimeHours: randFloat(1, 24),
        },
      });

      employerProfiles.push({ profileId: profile.id, userId: u.id });
    }
    console.log(`  ✓ Created ${employerProfiles.length} employer profiles`);

    // ═══════════════════════════════════════════════════════════════════
    // 5. CREATE USER SKILLS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n🎯 Creating user skills...');

    // Build skill slug -> id map
    const allSkills = await db.skill.findMany({ select: { id: true, slug: true } });
    const skillIdMap: Record<string, string> = {};
    for (const s of allSkills) {
      skillIdMap[s.slug] = s.id;
    }

    let totalUserSkills = 0;
    for (let i = 0; i < FREELANCER_SKILLS.length; i++) {
      const skillSlugs = FREELANCER_SKILLS[i];
      const proficiencies = FREELANCER_SKILL_PROFICIENCY[i] || [];
      const profileId = freelancerProfiles[i].profileId;

      for (let j = 0; j < skillSlugs.length; j++) {
        const skillId = skillIdMap[skillSlugs[j]];
        if (!skillId) continue;

        await db.userSkill.create({
          data: {
            userId: profileId, // UserSkill.userId references Profile.id
            skillId,
            proficiencyLevel: proficiencies[j] || pick(Object.values(PROFICIENCY_LEVEL)),
          },
        });
        totalUserSkills++;
      }
    }
    console.log(`  ✓ Created ${totalUserSkills} user skills`);

    // ═══════════════════════════════════════════════════════════════════
    // 6. CREATE PROJECTS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📋 Creating projects...');

    // Build category slug -> id map
    const allCategories = await db.category.findMany({ select: { id: true, slug: true } });
    const categoryIdMap: Record<string, string> = {};
    for (const c of allCategories) {
      categoryIdMap[c.slug] = c.id;
    }

    const createdProjects: { id: string; employerId: string; status: string; budgetMin: number; budgetMax: number; duration: string }[] = [];

    for (let i = 0; i < PROJECTS.length; i++) {
      const p = PROJECTS[i];
      const employer = employerUsers[i % employerUsers.length];
      const categoryId = categoryIdMap[p.categorySlug];
      const proposalCount = p.status === 'PUBLISHED' ? rand(0, 8) : rand(0, 5);

      const publishedAt = p.status === 'DRAFT' ? null :
        p.status === 'EXPIRED' ? daysAgo(45) :
        daysAgo(rand(0, 30));

      const expiresAt = p.status === 'EXPIRED' ? daysAgo(5) :
        p.status === 'COMPLETED' ? null :
        p.status === 'IN_PROGRESS' ? daysFromNow(60) :
        daysFromNow(rand(15, 45));

      const project = await db.project.create({
        data: {
          employerId: employer.id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          categoryId: categoryId || null,
          budgetMinRial: p.budgetMin,
          budgetMaxRial: p.budgetMax,
          estimatedDuration: p.duration,
          experienceLevel: p.experienceLevel,
          status: p.status,
          proposalLimit: 10,
          currentProposalCount: proposalCount,
          qualityScore: randFloat(40, 95),
          isFeatured: p.isFeatured,
          publishedAt,
          expiresAt,
        },
      });

      createdProjects.push({
        id: project.id,
        employerId: employer.id,
        status: p.status,
        budgetMin: p.budgetMin,
        budgetMax: p.budgetMax,
        duration: p.duration,
      });
    }
    console.log(`  ✓ Created ${createdProjects.length} projects`);

    // ═══════════════════════════════════════════════════════════════════
    // 7. CREATE PROJECT SKILLS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n🔗 Creating project skills...');

    let totalProjectSkills = 0;
    for (let i = 0; i < PROJECTS.length; i++) {
      const p = PROJECTS[i];
      const projectId = createdProjects[i].id;

      for (const skillSlug of p.skillSlugs) {
        const skillId = skillIdMap[skillSlug];
        if (!skillId) continue;

        await db.projectSkill.create({
          data: { projectId, skillId },
        });
        totalProjectSkills++;
      }
    }
    console.log(`  ✓ Created ${totalProjectSkills} project skills`);

    // ═══════════════════════════════════════════════════════════════════
    // 8. CREATE PROPOSALS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📝 Creating proposals...');

    // Proposal status distribution: 30 SUBMITTED, 10 VIEWED, 5 SHORTLISTED, 5 ACCEPTED, 8 REJECTED, 2 WITHDRAWN
    const proposalStatuses: string[] = [
      ...Array(30).fill(PROPOSAL_STATUS.SUBMITTED),
      ...Array(10).fill(PROPOSAL_STATUS.VIEWED),
      ...Array(5).fill(PROPOSAL_STATUS.SHORTLISTED),
      ...Array(5).fill(PROPOSAL_STATUS.ACCEPTED),
      ...Array(8).fill(PROPOSAL_STATUS.REJECTED),
      ...Array(2).fill(PROPOSAL_STATUS.WITHDRAWN),
    ];

    let totalProposals = 0;
    const acceptedProposals: { projectId: string; freelancerId: string; employerId: string; priceRial: number }[] = [];

    // Shuffle proposal statuses
    const shuffledStatuses = [...proposalStatuses].sort(() => Math.random() - 0.5);

    // Pre-generate unique (projectIdx, freelancerIdx) pairs to avoid duplicates
    const usedPairs = new Set<string>();
    const proposalPairs: { projectIdx: number; freelancerIdx: number }[] = [];

    for (let i = 0; i < shuffledStatuses.length + 20; i++) {
      if (proposalPairs.length >= shuffledStatuses.length) break;
      // Use a stride-based approach to get diverse pairs
      const projectIdx = i % createdProjects.length;
      const freelancerIdx = (i * 7 + Math.floor(i / createdProjects.length)) % freelancerUsers.length;
      const key = `${projectIdx}-${freelancerIdx}`;
      if (!usedPairs.has(key) && freelancerUsers[freelancerIdx].id !== createdProjects[projectIdx].employerId) {
        usedPairs.add(key);
        proposalPairs.push({ projectIdx, freelancerIdx });
      }
    }

    for (let i = 0; i < Math.min(shuffledStatuses.length, proposalPairs.length); i++) {
      const status = shuffledStatuses[i];
      const { projectIdx, freelancerIdx } = proposalPairs[i];
      const project = createdProjects[projectIdx];
      const freelancer = freelancerUsers[freelancerIdx];

      const proposedPrice = rand(
        Math.floor(project.budgetMin * 0.8),
        Math.floor(project.budgetMax * 1.1),
      );

      await db.proposal.create({
        data: {
          projectId: project.id,
          freelancerId: freelancer.id,
          priceRial: proposedPrice,
          estimatedDuration: project.duration,
          coverLetter: generateCoverLetter(pick(PROPOSAL_TEMPLATES)),
          status,
        },
      });

      if (status === PROPOSAL_STATUS.ACCEPTED) {
        acceptedProposals.push({
          projectId: project.id,
          freelancerId: freelancer.id,
          employerId: project.employerId,
          priceRial: proposedPrice,
        });
      }

      totalProposals++;
    }
    console.log(`  ✓ Created ${totalProposals} proposals`);

    // ═══════════════════════════════════════════════════════════════════
    // 9. CREATE REVIEWS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n⭐ Creating reviews...');

    // Create reviews for completed projects and some accepted proposals
    const reviewableProjects = createdProjects.filter(
      (p) => p.status === 'COMPLETED' || p.status === 'IN_PROGRESS'
    );

    let totalReviews = 0;
    for (let i = 0; i < Math.min(15, reviewableProjects.length * 2); i++) {
      const project = reviewableProjects[i % reviewableProjects.length];

      // Find an accepted proposal for this project, or use any freelancer
      const accepted = acceptedProposals.find((ap) => ap.projectId === project.id);
      const freelancerId = accepted?.freelancerId || freelancerUsers[i % freelancerUsers.length].id;

      // Get profiles
      const employerProfile = await db.profile.findUnique({ where: { userId: project.employerId } });
      const freelancerProfile = await db.profile.findUnique({ where: { userId: freelancerId } });
      if (!employerProfile || !freelancerProfile) continue;

      // Check for duplicate review
      const existingReview = await db.review.findUnique({
        where: { projectId_reviewerId: { projectId: project.id, reviewerId: employerProfile.id } },
      });
      if (existingReview) continue;

      await db.review.create({
        data: {
          projectId: project.id,
          reviewerId: employerProfile.id,
          revieweeId: freelancerProfile.id,
          rating: randFloat(3.5, 5.0),
          quality: randFloat(3.5, 5.0),
          communication: randFloat(3.5, 5.0),
          deadline: randFloat(3.0, 5.0),
          professionalism: randFloat(3.5, 5.0),
          comment: REVIEW_COMMENTS[i % REVIEW_COMMENTS.length],
        },
      });
      totalReviews++;
    }
    console.log(`  ✓ Created ${totalReviews} reviews`);

    // ═══════════════════════════════════════════════════════════════════
    // 10. CREATE NOTIFICATIONS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n🔔 Creating notifications...');

    const notificationData = [
      // Employer notifications about new proposals
      ...employerUsers.slice(0, 5).flatMap((e) => [
        {
          userId: e.id,
          type: NOTIFICATION_TYPE.PROPOSAL_RECEIVED,
          title: 'پیشنهاد جدید دریافت شد',
          body: 'یک فریلنسر جدید برای پروژه شما پیشنهاد ارسال کرده است.',
        },
        {
          userId: e.id,
          type: NOTIFICATION_TYPE.MESSAGE_RECEIVED,
          title: 'پیام جدید',
          body: 'یک فریلنسر پیام جدیدی برای شما ارسال کرده است.',
        },
      ]),
      // Freelancer notifications
      ...freelancerUsers.slice(0, 5).flatMap((f) => [
        {
          userId: f.id,
          type: NOTIFICATION_TYPE.INVITATION_RECEIVED,
          title: 'دعوت‌نامه پروژه جدید',
          body: 'یک کارفرما شما را به پروژه خود دعوت کرده است.',
        },
        {
          userId: f.id,
          type: NOTIFICATION_TYPE.PROPOSAL_STATUS_CHANGED,
          title: 'تغییر وضعیت پیشنهاد',
          body: 'پیشنهاد شما مشاهده شده و در حال بررسی است.',
        },
      ]),
      // Review notifications
      ...freelancerUsers.slice(0, 3).map((f) => ({
        userId: f.id,
        type: NOTIFICATION_TYPE.REVIEW_RECEIVED,
        title: 'نظر جدید دریافت شد',
        body: 'یک کارفرما جدید برای پروژه اخیر نظر داده است.',
      })),
      // System notifications
      {
        userId: freelancerUsers[0].id,
        type: NOTIFICATION_TYPE.SYSTEM,
        title: 'خوش آمدید!',
        body: 'به DevJoo خوش آمدید. پروفایل خود را تکمیل کنید تا شانس دریافت پروژه بیشتر شود.',
      },
      {
        userId: employerUsers[0].id,
        type: NOTIFICATION_TYPE.SYSTEM,
        title: 'خوش آمدید!',
        body: 'به DevJoo خوش آمدید. اولین پروژه خود را ثبت کنید.',
      },
      // Payment notifications
      ...employerUsers.slice(0, 3).map((e) => ({
        userId: e.id,
        type: NOTIFICATION_TYPE.PAYMENT_RECEIVED,
        title: 'پرداخت موفق',
        body: 'پرداخت برای پروژه شما با موفقیت انجام شد.',
      })),
    ];

    await db.notification.createMany({ data: notificationData });
    console.log(`  ✓ Created ${notificationData.length} notifications`);

    // ═══════════════════════════════════════════════════════════════════
    // 11. CREATE CONVERSATIONS + MESSAGES
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n💬 Creating conversations...');

    const conversationPairs = [
      { employerIdx: 0, freelancerIdx: 0, projectIdx: 0 },
      { employerIdx: 1, freelancerIdx: 1, projectIdx: 1 },
      { employerIdx: 2, freelancerIdx: 2, projectIdx: 3 },
      { employerIdx: 0, freelancerIdx: 3, projectIdx: 5 },
      { employerIdx: 3, freelancerIdx: 4, projectIdx: 7 },
      { employerIdx: 4, freelancerIdx: 5, projectIdx: 9 },
      { employerIdx: 5, freelancerIdx: 6, projectIdx: 8 },
      { employerIdx: 6, freelancerIdx: 7, projectIdx: 15 },
      { employerIdx: 7, freelancerIdx: 8, projectIdx: 2 },
      { employerIdx: 1, freelancerIdx: 9, projectIdx: 17 },
    ];

    let totalMessages = 0;
    for (const pair of conversationPairs) {
      const employer = employerUsers[pair.employerIdx];
      const freelancer = freelancerUsers[pair.freelancerIdx];
      const project = createdProjects[pair.projectIdx];

      const conversation = await db.conversation.create({
        data: {
          type: 'PROJECT',
          projectId: project.id,
        },
      });

      // Add members
      await db.conversationMember.createMany({
        data: [
          { conversationId: conversation.id, userId: employer.id },
          { conversationId: conversation.id, userId: freelancer.id },
        ],
      });

      // Create messages (3-8 per conversation)
      const msgCount = rand(3, 8);
      const isEmployerFirst = Math.random() > 0.5;
      const firstSender = isEmployerFirst ? employer : freelancer;
      const secondSender = isEmployerFirst ? freelancer : employer;

      const messages: { senderId: string; content: string; createdAt: Date }[] = [];
      let currentTime = hoursAgo(msgCount * 3);

      for (let m = 0; m < msgCount; m++) {
        const sender = m % 2 === 0 ? firstSender : secondSender;
        let content: string;

        if (m === 0) {
          content = isEmployerFirst
            ? pick(CONVERSATION_STARTERS)
            : pick(CONVERSATION_STARTERS);
        } else if (m === 1) {
          content = pick(CONVERSATION_REPLIES);
        } else if (m === msgCount - 1) {
          content = pick(CONVERSATION_CLOSERS);
        } else {
          content = pick(CONVERSATION_FOLLOWS);
        }

        messages.push({
          senderId: sender.id,
          content,
          createdAt: new Date(currentTime),
        });

        currentTime = new Date(currentTime.getTime() + rand(30, 180) * 60 * 1000);
      }

      for (const msg of messages) {
        await db.message.create({
          data: {
            conversationId: conversation.id,
            senderId: msg.senderId,
            content: msg.content,
            type: MESSAGE_TYPE.TEXT,
            createdAt: msg.createdAt,
          },
        });
        totalMessages++;
      }
    }
    console.log(`  ✓ Created ${conversationPairs.length} conversations with ${totalMessages} messages`);

    // ═══════════════════════════════════════════════════════════════════
    // 12. CREATE BLOG POSTS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n📰 Creating blog posts...');

    // Create a blog category first
    let blogCategory = await db.blogCategory.findFirst({ where: { slug: 'freelancing-tips' } });
    if (!blogCategory) {
      blogCategory = await db.blogCategory.create({
        data: {
          name: 'نکات فریلنسری',
          slug: 'freelancing-tips',
        },
      });
    }

    let totalBlogPosts = 0;
    for (let i = 0; i < BLOG_POSTS.length; i++) {
      const bp = BLOG_POSTS[i];
      const author = adminUsers[i % adminUsers.length];

      await db.blogPost.create({
        data: {
          title: bp.title,
          slug: bp.slug,
          body: bp.content,
          excerpt: bp.content.split('\n')[0].substring(0, 200),
          authorId: author.id,
          categoryId: blogCategory.id,
          isPublished: true,
          publishedAt: daysAgo(rand(1, 60)),
        },
      });
      totalBlogPosts++;
    }
    console.log(`  ✓ Created ${totalBlogPosts} blog posts`);

    // ═══════════════════════════════════════════════════════════════════
    // 13. CREATE SERVICE LISTINGS
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n🛒 Creating service listings...');

    let totalServiceListings = 0;
    for (const sl of SERVICE_LISTINGS) {
      const freelancer = freelancerUsers[sl.freelancerIdx];
      const categoryId = categoryIdMap[sl.categorySlug];

      const service = await db.serviceListing.create({
        data: {
          freelancerId: freelancer.id,
          title: sl.title,
          slug: sl.slug,
          description: sl.description,
          categoryId: categoryId || null,
          priceRial: sl.priceRial,
          deliveryDays: sl.deliveryDays,
          revisions: rand(1, 3),
          status: SERVICE_LISTING_STATUS.PUBLISHED,
          isFeatured: sl.freelancerIdx < 3,
          totalOrders: rand(0, 25),
          averageRating: randFloat(4.0, 5.0),
        },
      });

      // Create service skills
      for (const skillSlug of sl.skillSlugs) {
        const skillId = skillIdMap[skillSlug];
        if (!skillId) continue;
        await db.serviceListingSkill.create({
          data: {
            serviceListingId: service.id,
            skillId,
          },
        });
      }

      totalServiceListings++;
    }
    console.log(`  ✓ Created ${totalServiceListings} service listings`);

    // ═══════════════════════════════════════════════════════════════════
    // SUMMARY
    // ═══════════════════════════════════════════════════════════════════
    console.log('\n✅ Comprehensive seed complete!');
    console.log(`   👥 Users: ${freelancerUsers.length} freelancers + ${employerUsers.length} employers + ${adminUsers.length} admins = ${freelancerUsers.length + employerUsers.length + adminUsers.length}`);
    console.log(`   📄 Profiles: ${freelancerProfiles.length} freelancer + ${employerProfiles.length} employer`);
    console.log(`   🎯 User Skills: ${totalUserSkills}`);
    console.log(`   📋 Projects: ${createdProjects.length}`);
    console.log(`   🔗 Project Skills: ${totalProjectSkills}`);
    console.log(`   📝 Proposals: ${totalProposals}`);
    console.log(`   ⭐ Reviews: ${totalReviews}`);
    console.log(`   🔔 Notifications: ${notificationData.length}`);
    console.log(`   💬 Conversations: ${conversationPairs.length}`);
    console.log(`   📰 Blog Posts: ${totalBlogPosts}`);
    console.log(`   🛒 Service Listings: ${totalServiceListings}`);
    console.log(`\n🔑 Demo Accounts (password: devjoo123):`);
    console.log(`   Freelancer: ${freelancerUsers[0].email} (phone: ${freelancerUsers[0].phone})`);
    console.log(`   Employer:   ${employerUsers[0].email} (phone: ${employerUsers[0].phone})`);
    console.log(`   Admin:      ${adminUsers[0].email} (phone: ${adminUsers[0].phone})`);

  } catch (error) {
    console.error('❌ Comprehensive seed failed:', error);
    throw error;
  }
}

// Allow running standalone
if (require.main === module) {
  seedComprehensiveData()
    .catch((e) => {
      console.error('Seed failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await db.$disconnect();
    });
}
