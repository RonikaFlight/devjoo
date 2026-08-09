import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { listAdminVerifications } from '@/modules/admin/service';
import { VERIFICATION_STATUS_LABELS, VERIFICATION_TYPE_LABELS } from '@/types/enums';
import type { VerificationStatus } from '@/types/enums';

const ROLE_LABELS: Record<string, string> = {
  freelancer: 'فریلنسر',
  employer: 'کارفرما',
};

function getStatusBadge(status: VerificationStatus) {
  switch (status) {
    case 'PENDING':
      return (
        <Badge
          variant='destructive'
          className='bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
        >
          {VERIFICATION_STATUS_LABELS[status]}
        </Badge>
      );
    case 'APPROVED':
      return (
        <Badge
          variant='default'
          className='bg-green-600 text-white hover:bg-green-700'
        >
          {VERIFICATION_STATUS_LABELS[status]}
        </Badge>
      );
    case 'REJECTED':
      return (
        <Badge variant='destructive'>
          {VERIFICATION_STATUS_LABELS[status]}
        </Badge>
      );
  }
}

export default async function AdminVerificationsPage() {
  const { verifications } = await listAdminVerifications({
    page: 1,
    limit: 20,
    status: 'PENDING',
  });

  return (
    <div>
      <h1 className='mb-6 text-2xl font-bold'>مدیریت تاییدیه‌ها</h1>

      <div className='rounded-lg border'>
        <Table dir='rtl'>
          <TableHeader>
            <TableRow>
              <TableHead>شناسه پروفایل</TableHead>
              <TableHead>نوع</TableHead>
              <TableHead>نقش</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>تاریخ</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {verifications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className='h-24 text-center text-muted-foreground'
                >
                  تاییدیه‌ای یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              verifications.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className='font-mono text-xs'>
                    {v.profileId?.slice(0, 8)}…
                  </TableCell>
                  <TableCell>
                    {VERIFICATION_TYPE_LABELS[v.type as keyof typeof VERIFICATION_TYPE_LABELS] || v.type}
                  </TableCell>
                  <TableCell>
                    {ROLE_LABELS[v._role] || v._role}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(v.status as VerificationStatus)}
                  </TableCell>
                  <TableCell>
                    {new Date(v.createdAt).toLocaleDateString('fa-IR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
