import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { listAdminProjects } from '@/modules/admin/service';
import { PROJECT_STATUS_LABELS } from '@/types/enums';
import type { ProjectStatus } from '@/types/enums';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

const STATUS_BADGE_VARIANT: Record<ProjectStatus, BadgeVariant> = {
  PUBLISHED: 'default',
  PENDING_REVIEW: 'destructive',
  DRAFT: 'secondary',
  REJECTED: 'destructive',
  PAUSED: 'outline',
  IN_PROGRESS: 'default',
  COMPLETED: 'default',
  CANCELLED: 'outline',
  EXPIRED: 'outline',
};

const STATUS_BADGE_CLASS: Partial<Record<ProjectStatus, string>> = {
  PUBLISHED: 'bg-green-600 text-white hover:bg-green-700',
  PENDING_REVIEW: 'bg-amber-500 text-white hover:bg-amber-600',
};

export default async function AdminProjectsPage() {
  const { projects, meta } = await listAdminProjects({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">مدیریت پروژه‌ها</h1>

      <div className="rounded-lg border">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>دسته‌بندی</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>پیشنهادها</TableHead>
              <TableHead>امتیاز</TableHead>
              <TableHead>ویژه</TableHead>
              <TableHead>تاریخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  پروژه‌ای یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.title}</TableCell>
                  <TableCell>{project.category?.name || '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={STATUS_BADGE_VARIANT[project.status as ProjectStatus]}
                      className={STATUS_BADGE_CLASS[project.status as ProjectStatus]}
                    >
                      {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell>{project._count.proposals}</TableCell>
                  <TableCell>{project.qualityScore ?? '—'}</TableCell>
                  <TableCell>
                    {project.isFeatured ? (
                      <Badge className="bg-purple-600 text-white hover:bg-purple-700">ویژه</Badge>
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{new Date(project.createdAt).toLocaleDateString('fa-IR')}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        نمایش {meta.total.toLocaleString('fa-IR')} پروژه (صفحه {meta.page.toLocaleString('fa-IR')} از {meta.totalPages.toLocaleString('fa-IR')})
      </p>
    </div>
  );
}
