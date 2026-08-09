import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { listAdminUsers } from '@/modules/admin/service';
import type { adminUserListSchema } from '@/lib/validators/admin';
import { USER_ROLES } from '@/types/enums';

type AdminUserListInput = (typeof adminUserListSchema)['_output'];

const ROLE_BADGE_VARIANT: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [USER_ROLES.ADMIN]: 'destructive',
  [USER_ROLES.FREELANCER]: 'default',
  [USER_ROLES.EMPLOYER]: 'secondary',
  [USER_ROLES.MODERATOR]: 'outline',
};

const ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.ADMIN]: 'مدیر',
  [USER_ROLES.FREELANCER]: 'فریلنسر',
  [USER_ROLES.EMPLOYER]: 'کارفرما',
  [USER_ROLES.MODERATOR]: 'ناظر',
};

export default async function AdminUsersPage() {
  const { users, meta } = await listAdminUsers({
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  } as AdminUserListInput);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">مدیریت کاربران</h1>

      <p className="mb-4 text-sm text-muted-foreground">
        جستجو، فیلتر و صفحه‌بندی در نسخه‌های بعدی با کامپوننت‌های کلاینت اضافه خواهد شد.
      </p>

      <div className="rounded-lg border">
        <Table dir="rtl">
          <TableHeader>
            <TableRow>
              <TableHead>نام</TableHead>
              <TableHead>ایمیل/تلفن</TableHead>
              <TableHead>نقش‌ها</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>تاریخ</TableHead>
              <TableHead>عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  کاربری یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">
                    {user.displayName || '—'}
                  </TableCell>
                  <TableCell>
                    {user.email || user.phone || '—'}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r) => (
                        <Badge
                          key={r.role.name}
                          variant={ROLE_BADGE_VARIANT[r.role.name] ?? 'outline'}
                        >
                          {ROLE_LABELS[r.role.name] ?? r.role.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge className="bg-green-600 text-white hover:bg-green-700">
                        فعال
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        غیرفعال
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString('fa-IR')}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      مشاهده
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        نمایش {meta.total.toLocaleString('fa-IR')} کاربر (صفحه {meta.page.toLocaleString('fa-IR')} از {meta.totalPages.toLocaleString('fa-IR')})
      </p>
    </div>
  );
}
