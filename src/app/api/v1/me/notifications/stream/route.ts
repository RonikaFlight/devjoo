import { requireAuth, authErrorResponse, type AuthUser } from '@/lib/auth/helpers';
import { db } from '@/lib/db';

/**
 * SSE endpoint for real-time notification push.
 * Client connects with GET /api/v1/me/notifications/stream.
 * Server sends events when new notifications arrive.
 * 
 * In production, replace polling with Redis Pub/Sub.
 * Current implementation: long-polling with 15s interval.
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    const userId = auth.user.id;

    const encoder = new TextEncoder();
    let lastCheck = new Date();
    let keepAlive = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial connection event
        controller.enqueue(
          encoder.encode(`event: connected\ndata: {"userId":"${userId}"}\n\n`)
        );

        // Poll for new notifications every 3 seconds
        intervalId = setInterval(async () => {
          if (!keepAlive) return;

          try {
            const newNotifications = await db.notification.findMany({
              where: {
                userId,
                createdAt: { gt: lastCheck },
              },
              });

            if (newNotifications.length > 0) {
              for (const n of newNotifications) {
                controller.enqueue(
                  encoder.encode(
                    `event: notification\ndata: ${JSON.stringify({
                      id: n.id,
                      type: n.type,
                      title: n.title,
                      body: n.body,
                      data: n.data ? JSON.parse(n.data) : null,
                      createdAt: n.createdAt,
                    })}\n\n`
                  )
                );
              }
            }

            lastCheck = new Date();

            // Keepalive ping every cycle
            controller.enqueue(encoder.encode(`: keepalive\n\n`));
          } catch {
            keepAlive = false;
            if (intervalId) clearInterval(intervalId);
            try { controller.close(); } catch { /* ignore */ }
          }
        }, 3000);

        // Clean up on abort
        const cleanup = () => {
          keepAlive = false;
          if (intervalId) clearInterval(intervalId);
          try { controller.close(); } catch { /* ignore */ }
        };

        // Store cleanup for abort
        (stream as unknown as { _cleanup: () => void })._cleanup = cleanup;
      },
      cancel() {
        keepAlive = false;
        if (intervalId) clearInterval(intervalId);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      return authErrorResponse(error as Parameters<typeof authErrorResponse>[0]);
    }
    return new Response(
      JSON.stringify({ error: { code: 'INTERNAL', message: 'خطای سرور.' } }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
