import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getFeatureFlagInfo, listAuditLogs } from '@/modules/admin/service';
import { ADMIN_ACTION_LABELS, ADMIN_RESOURCE_TYPE_LABELS } from '@/types/enums';

export default async function AdminSettingsPage() {
  const [featureFlags, { logs }] = await Promise.all([
    getFeatureFlagInfo(),
    listAuditLogs({ page: 1, limit: 20 }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">تنظیمات</h1>

      {/* ── Section 1: Feature Flags ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">تنظیمات سیستم</h2>

        <div className="grid gap-3">
          {featureFlags.map((flag) => (
            <Card key={flag.key}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <p className="font-medium leading-none">{flag.description}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">{flag.key}</p>
                  <p className="text-xs text-muted-foreground font-mono">{flag.envKey}</p>
                </div>
                <Badge
                  className={
                    flag.value
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                  }
                >
                  {flag.value ? 'فعال' : 'غیرفعال'}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* ── Section 2: Audit Logs ── */}
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">گزارش تغییرات</h2>

        <div className="rounded-lg border">
          <Table dir="rtl">
            <TableHeader>
              <TableRow>
                <TableHead>تاریخ</TableHead>
                <TableHead>عملگر</TableHead>
                <TableHead>عملیات</TableHead>
                <TableHead>نوع منبع</TableHead>
                <TableHead>شناسه منبع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    گزارشی یافت نشد.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      {new Date(log.createdAt).toLocaleDateString('fa-IR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell>{log.actorId ? `${log.actorId.slice(0, 8)}…` : 'سیستم'}</TableCell>
                    <TableCell>
                      {(ADMIN_ACTION_LABELS as Record<string, string>)[log.action] || log.action}
                    </TableCell>
                    <TableCell>
                      {(ADMIN_RESOURCE_TYPE_LABELS as Record<string, string>)[log.resourceType] || log.resourceType}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.resourceId ? `${log.resourceId.slice(0, 8)}…` : '—'}
                    </TableCell>
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
