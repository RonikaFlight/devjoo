import Link from "next/link";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
            </nav>
          </div>

          {/* Popular Skills */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">مهارت‌های پرطرفدار</h3>
            <nav className="flex flex-col gap-2">
              {siteConfig.footer.popularSkills.map((skill) => (
                <Link
                  key={skill}
                  href={`/projects/${skill.toLowerCase()}`}
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  {skill}
                </Link>
              ))}
            </nav>
          </div>

          {/* About */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-text-primary">درباره DevJoo</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/about" className="text-sm text-text-secondary hover:text-primary transition-colors">
                درباره ما
              </Link>
              <Link href="/contact" className="text-sm text-text-secondary hover:text-primary transition-colors">
                تماس با ما
              </Link>
              <Link href="/terms" className="text-sm text-text-secondary hover:text-primary transition-colors">
                قوانین و مقررات
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