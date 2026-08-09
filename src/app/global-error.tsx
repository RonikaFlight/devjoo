export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="fa" dir="rtl">
      <body className="flex min-h-screen items-center justify-center bg-background font-[Vazirmatn]">
        <div className="mx-auto max-w-md px-4 text-center">
          <h1 className="text-4xl font-bold text-primary">خطای سرور</h1>
          <p className="mt-4 text-muted-foreground">
            متأسفانه در پردازش درخواست شما خطایی رخ داده است.
          </p>
          {error.digest && (
            <p className="mt-2 text-xs text-muted-foreground">
              کد خطا: {error.digest}
            </p>
          )}
          <button
            onClick={reset}
            className="mt-8 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
          >
            تلاش مجدد
          </button>
        </div>
      </body>
    </html>
  );
}
