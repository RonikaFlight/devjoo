import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-primary">۴۰۴</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        صفحه‌ای که دنبال آن هستید یافت نشد.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/"
          className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
        >
          بازگشت به خانه
        </Link>
        <Link
          href="/projects"
          className="rounded-lg border border-border bg-surface px-6 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
        >
          مشاهده پروژه‌ها
        </Link>
      </div>
    </main>
  );
}
