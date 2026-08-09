import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { listAdminRedirects, listAdminBlogCategories } from '@/modules/admin/service';

export default async function AdminSeoPage() {
  const [redirects, blogCategories] = await Promise.all([
    listAdminRedirects(),
    listAdminBlogCategories(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">سئو و محتوا</h1>

      {/* ── Section 1: Redirects ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">تغییرمسیرها</h2>

        <div className="rounded-lg border">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>مسیر مبدا</TableHead>
                <TableHead>مسیر مقصد</TableHead>
                <TableHead>نوع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redirects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    تغییرمسیری یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                redirects.map((redirect) => (
                  <TableRow key={redirect.id}>
                    <TableCell className="font-medium">{redirect.fromPath}</TableCell>
                    <TableCell>{redirect.toPath}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          redirect.type === '301'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                        }
                      >
                        {redirect.type}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator className="my-8" />

      {/* ── Section 2: Blog Categories ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">دسته‌بندی بلاگ</h2>

        <div className="rounded-lg border">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>اسلاگ</TableHead>
                <TableHead>تعداد پست</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blogCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    دسته‌بندی بلاگی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                blogCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category._count.posts}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
