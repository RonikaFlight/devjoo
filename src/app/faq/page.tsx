import type { Metadata } from 'next';
import { generatePageMetadata } from '@/lib/seo/metadata';
import { Breadcrumbs } from '@/components/seo/breadcrumbs';
import { StructuredData } from '@/components/seo/structured-data';
import { generateFaqLd } from '@/lib/seo/structured-data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = generatePageMetadata({
  title: 'سوالات متداول',
  description:
    'پاسخ سوالات رایج درباره DevJoo: نحوه ثبت پروژه، پرداخت، مدیریت فریلنسری، حریم خصوصی و بیشتر.',
  path: '/faq',
});

const faqCategories = [
  {
    title: 'عمومی',
    items: [
      {
        q: 'DevJoo چیست؟',
        a: 'DevJoo بازار هوشمند پروژه‌های تکنولوژی و دیجیتال است. در این پلتفرم، کارفرماها پروژه‌های خود را ثبت می‌کنند و فریلنسرهای متخصص پیشنهاد می‌دهند. سیستم هوشمند ما بر اساس مهارت‌ها، تجربه و امتیاز فریلنسرها، بهترین تطبیق را ایجاد می‌کند.',
      },
      {
        q: 'آیا استفاده از DevJoo رایگان است؟',
        a: 'بله، ثبت‌نام و ثبت پروژه در DevJoo کاملاً رایگان است. کارمزد فقط پس از تأیید تحویل پروژه و از مبلغ پرداختی کارفرما کسر می‌شود. فریلنسرها نیز برای ثبت‌نام و ارسال پیشنهاد هیچ هزینه‌ای پرداخت نمی‌کنند.',
      },
      {
        q: 'آیا برای ثبت‌نام نیاز به احراز هویت هست؟',
        a: 'بله، برای فعالیت حرفه‌ای و دریافت پرداخت، احراز هویت الزامی است. این کار از طریق بارگذاری تصویر کارت ملی و تایید شماره موبایل انجام می‌شود. تمامی اطلاعات شخصی شما محرمانه باقی می‌ماند.',
      },
    ],
  },
  {
    title: 'فریلنسرها',
    items: [
      {
        q: 'چگونه می‌توانم در DevJoo فعالیت کنم؟',
        a: 'ابتدا در سایت ثبت‌نام کنید و نقش «فریلنسر» را انتخاب کنید. سپس پروفایل خود را تکمیل کنید، مهارت‌ها و نمونه‌کارهایتان را اضافه کنید و احراز هویت شوید. بعد از آن می‌توانید به پروژه‌ها پیشنهاد ارسال کنید.',
      },
      {
        q: 'محدودیت ارسال پیشنهاد چقدر است؟',
        a: 'هر فریلنسر به صورت پیش‌فرض می‌تواند به ۱۰ پروژه همزمان پیشنهاد ارسال کند. این محدودیت قابل تنظیم است و با افزایش امتیاز و تکمیل پروفایل، امکان افزایش آن وجود دارد.',
      },
      {
        q: 'درآمد خود را چگونه دریافت می‌کنم؟',
        a: 'پس از تأیید تحویل پروژه توسط کارفرما، مبلغ به حساب کیف پول DevJoo شما واریز می‌شود. سپس می‌توانید آن را به حساب بانکی خود منتقل کنید. تسویه‌حساب معمولاً ظرف ۱ تا ۳ روز کاری انجام می‌شود.',
      },
    ],
  },
  {
    title: 'کارفرماها',
    items: [
      {
        q: 'چگونه پروژه ثبت کنم؟',
        a: 'پس از ثبت‌نام و ورود به حساب کاربری، به بخش «ثبت پروژه» بروید. عنوان، توضیحات، بودجه و مهلت پروژه را وارد کنید. پروژه شما پس از بررسی و تأیید منتشر شده و فریلنسرها می‌توانند پیشنهاد خود را ارسال کنند.',
      },
      {
        q: 'چگونه فریلنسر مناسب را انتخاب کنم؟',
        a: 'پیشنهادهای فریلنسرها شامل قیمت، مدت زمان تخمینی، توضیحات و نمونه‌کارهای آن‌هاست. همچنین سیستم امتیازدهی و نظرات قبلی کارفرماها به شما کمک می‌کند بهترین تصمیم را بگیرید.',
      },
      {
        q: 'آیا می‌توانم پروژه را لغو کنم؟',
        a: 'اگر هنوز فریلنسری انتخاب نکرده‌اید، می‌توانید پروژه را لغو کنید. اگر فریلنسر انتخاب شده اما کار شروع نشده، لغو با توافق طرفین امکان‌پذیر است. در صورت شروع کار، شرایط قرارداد اعمال می‌شود.',
      },
    ],
  },
  {
    title: 'پرداخت',
    items: [
      {
        q: 'سیستم پرداخت امانی چیست؟',
        a: 'در سیستم پرداخت امانی، مبلغ پروژه ابتدا به حساب امانی DevJoo واریز می‌شود و تا زمان تأیید تحویل نزد ما نگه‌داری می‌گردد. این روش تضمین می‌کند که فریلنسر مطمئن باشد مبلغ وجود دارد و کارفرما مطمئن باشد که پول تا قبل از تحویل پرداخت نمی‌شود.',
      },
      {
        q: 'روش‌های پرداخت چیست؟',
        a: 'در حال حاضر پرداخت از طریق درگاه‌های بانکی آنلاین (کارت به کارت و درگاه زرین‌پال) امکان‌پذیر است. به زودی سایر روش‌ها مانند کیف پول الکترونیکی نیز اضافه خواهند شد.',
      },
      {
        q: 'کارمزد DevJoo چقدر است؟',
        a: 'کارمزد DevJoo از مبلغ کل پروژه کسر می‌شود و درصد آن بسته به نوع پروژه و حجم معاملات متفاوت است. جزئیات دقیق کارمزد در صفحه قوانین و مقررات قابل مشاهده است.',
      },
    ],
  },
];

// Flatten all FAQs for structured data
const allFaqs = faqCategories.flatMap((cat) =>
  cat.items.map((item) => ({ question: item.q, answer: item.a })),
);

export default function FaqPage() {
  const faqLd = generateFaqLd(allFaqs);

  return (
    <main>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'صفحه اصلی', href: '/' },
              { label: 'سوالات متداول' },
            ]}
          />
        </div>
        <StructuredData data={faqLd} />

        {/* Hero */}
        <section className="mb-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary mb-3">
            سوالات متداول
          </h1>
          <p className="mx-auto max-w-xl text-text-secondary leading-relaxed">
            پاسخ رایج‌ترین سوالات درباره DevJoo را اینجا پیدا کنید.
          </p>
        </section>

        {/* FAQ Categories */}
        <div className="space-y-10 max-w-3xl mx-auto">
          {faqCategories.map((cat) => (
            <div key={cat.title}>
              <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-soft text-xs font-bold text-primary">
                  {cat.title.charAt(0)}
                </span>
                {cat.title}
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {cat.items.map((item, idx) => (
                  <AccordionItem
                    key={idx}
                    value={`${cat.title}-${idx}`}
                  >
                    <AccordionTrigger className="text-text-primary font-medium text-start">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-text-secondary leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-primary p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            پاسخ سوال خود را پیدا نکردید؟
          </h2>
          <p className="mx-auto max-w-md text-white/80 mb-6">
            از طریق فرم تماس با ما یا ایمیل، سوالتان را بپرسید. تیم ما در اسرع وقت پاسخ خواهد داد.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link href="/contact">
              تماس با ما
              <ArrowLeft className="ms-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
