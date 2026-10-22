// app/api/masar/notifications/route.ts
// إشعارات المهام: القراءة وتعليمها كمقروءة

import { prisma } from '@/lib/db';
import { handle, ok, requireUser } from '@/lib/masar/http';

export const dynamic = 'force-dynamic';
const TASK_TYPES = ['TASK_ASSIGNED', 'TASK_COMMENT', 'TASK_UPDATED'] as const;

export const GET = handle(async () => {
  const me = await requireUser();
  const [items, unread] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: me.id, type: { in: [...TASK_TYPES] } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.notification.count({ where: { userId: me.id, type: { in: [...TASK_TYPES] }, read: false } }),
  ]);
  return ok({
    unread,
    notifications: items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      read: n.read,
      data: n.data,
      createdAt: n.createdAt.toISOString(),
    })),
  });
});

/** يعلّم كل إشعارات المهام كمقروءة */
export const POST = handle(async () => {
  const me = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: me.id, type: { in: [...TASK_TYPES] }, read: false },
    data: { read: true, readAt: new Date() },
  });
  return ok({ ok: true });
});
