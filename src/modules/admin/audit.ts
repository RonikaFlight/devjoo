import { db } from '@/lib/db';

/**
 * Write an audit log entry.
 * Non-blocking — failures are silently caught to avoid breaking admin operations.
 */
export async function auditLog(params: {
  actorId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        resourceType: params.resourceType,
        resourceId: params.resourceId || null,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      },
    });
  } catch {
    // Audit log failure should never break the main operation
  }
}
