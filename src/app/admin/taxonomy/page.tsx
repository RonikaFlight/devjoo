import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { listAdminCategories, listAdminSkills } from '@/modules/admin/service';

export default async function AdminTaxonomyPage() {
  const categories = await listAdminCategories();
  const skills = await listAdminSkills();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">مدیریت دسته‌بندی و مهارت‌ها</h1>

      {/* ── Section 1: Categories ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">دسته‌بندی‌ها</h2>

        <div className="rounded-lg border">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>اسلاگ</TableHead>
                <TableHead>تعداد مهارت</TableHead>
                <TableHead>تعداد پروژه</TableHead>
                <TableHead>ترتیب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    دسته‌بندی‌ای یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.slug}</TableCell>
                    <TableCell>{category._count.skills}</TableCell>
                    <TableCell>{category._count.projects}</TableCell>
                    <TableCell>{category.displayOrder}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <Separator className="my-8" />

      {/* ── Section 2: Skills ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">مهارت‌ها</h2>

        <div className="rounded-lg border">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>اسلاگ</TableHead>
                <TableHead>دسته‌بندی</TableHead>
                <TableHead>مترادف‌ها</TableHead>
                <TableHead>ترتیب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    مهارتی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                skills.map((skill) => (
                  <TableRow key={skill.id}>
                    <TableCell className="font-medium">{skill.name}</TableCell>
                    <TableCell>{skill.slug}</TableCell>
                    <TableCell>{skill.category?.name ?? '—'}</TableCell>
                    <TableCell>{skill._count.synonyms}</TableCell>
                    <TableCell>{skill.displayOrder}</TableCell>
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
