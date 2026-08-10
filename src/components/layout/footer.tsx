import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <span className="text-xl font-extrabold text-primary">DevJoo</span>
            </Link>
            <p className="text-sm text-text-secondary leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">دسترسی سریع</h3>
            <nav className="flex flex-col gap-2">
              {siteConfig.nav.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link href="/hire" className="text-sm text-text-secondary hover:text-primary transition-colors">
                استخدام فریلنسر
              </Link>
            </nav>
          </div>

          {/* Popular Skills — linked to skill pages */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">مهارت‌های پرطرفدار</h3>
            <nav className="flex flex-col gap-2">
              {siteConfig.footer.popularSkills.map((skill) => {
                const slugMap: Record<string, string> = {
                  'React': 'react', 'Next.js': 'nextjs', 'WordPress': 'wordpress',
                  'Python': 'python', 'UI/UX': 'ui-design', 'SEO': 'seo',
                  'Node.js': 'nodejs', 'AI': 'llm',
                };
                const slug = slugMap[skill] || skill.toLowerCase().replace(/[^a-z0-9-]/g, '');
                return (
                  <Link
                    key={skill}
                    href={`/projects/skills/${slug}`}
                    className="text-sm text-text-secondary hover:text-primary transition-colors"
                  >
                    پروژه‌های {skill}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">دسته‌بندی‌ها</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/categories" className="text-sm text-text-secondary hover:text-primary transition-colors">
                همه دسته‌بندی‌ها
              </Link>
              <Link href="/projects/web-development" className="text-sm text-text-secondary hover:text-primary transition-colors">
                برنامه‌نویسی وب
              </Link>
              <Link href="/projects/mobile-app-development" className="text-sm text-text-secondary hover:text-primary transition-colors">
                اپلیکیشن موبایل
              </Link>
              <Link href="/projects/ui-ux-design" className="text-sm text-text-secondary hover:text-primary transition-colors">
                طراحی UI/UX
              </Link>
              <Link href="/projects/ai-machine-learning" className="text-sm text-text-secondary hover:text-primary transition-colors">
                هوش مصنوعی
              </Link>
              <Link href="/projects/seo-digital-marketing" className="text-sm text-text-secondary hover:text-primary transition-colors">
                سئو و دیجیتال مارکتینگ
              </Link>
            </nav>
          </div>

          {/* About DevJoo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">درباره DevJoo</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-text-secondary hover:text-primary transition-colors">
                درباره ما
              </Link>
              <Link href="/contact" className="text-sm text-text-secondary hover:text-primary transition-colors">
                تماس با ما
              </Link>
              <Link href="/faq" className="text-sm text-text-secondary hover:text-primary transition-colors">
                سوالات متداول
              </Link>
              <Link href="/terms" className="text-sm text-text-secondary hover:text-primary transition-colors">
                قوانین و مقررات
              </Link>
              <Link href="/privacy" className="text-sm text-text-secondary hover:text-primary transition-colors">
                حریم خصوصی
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-text-secondary">
            تمامی حقوق محفوظ است © {new Date().getFullYear()} DevJoo
          </p>
          <p className="text-xs text-text-secondary">
            بازار هوشمند پروژه‌های تکنولوژی و دیجیتال
          </p>
        </div>
      </div>
    </footer>
  );
}
