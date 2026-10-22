// app/api/masar/bootstrap/route.ts
// بيانات بدء التطبيق: المستخدم ومساحات عمله وهل الذكاء الاصطناعي مفعّل

import { prisma } from '@/lib/db';
import { handle, ok, requireUser } from '@/lib/masar/http';
import { ensurePersonalWorkspace } from '@/lib/masar/service';
import { aiEnabled } from '@/lib/masar/ai';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const me = await requireUser();
  await ensurePersonalWorkspace(me.id, me.name);
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: me.id },
    include: { workspace: { include: { _count: { select: { boards: { where: { archivedAt: null } } } } } } },
    orderBy: { createdAt: 'asc' },
  });
  return ok({
    me,
    ai: aiEnabled(),
    workspaces: memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      role: m.role,
      invoicing: !!m.workspace.vendorId,
      boardCount: m.workspace._count.boards,
    })),
  });
});
