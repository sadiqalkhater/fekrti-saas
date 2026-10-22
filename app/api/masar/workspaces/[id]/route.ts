// app/api/masar/workspaces/[id]/route.ts
// تفاصيل مساحة العمل: الأعضاء واللوحات

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, ok, parseBody, requireUser } from '@/lib/masar/http';
import { requireWorkspace, workspaceMembers } from '@/lib/masar/service';

type Ctx = { params: { id: string } };
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const me = await requireUser();
  const member = await requireWorkspace(me.id, params.id);
  const [workspace, members, boards] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({ where: { id: params.id } }),
    workspaceMembers(params.id),
    prisma.board.findMany({
      where: { workspaceId: params.id, archivedAt: null },
      orderBy: { createdAt: 'asc' },
      select: { id: true, name: true, color: true },
    }),
  ]);
  return ok({
    workspace: { id: workspace.id, name: workspace.name, role: member.role, invoicing: !!workspace.vendorId },
    members,
    boards,
  });
});

const patchSchema = z.object({ name: z.string().trim().min(1).max(80) });

export const PATCH = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  await requireWorkspace(me.id, params.id, 'ADMIN');
  const body = await parseBody(request, patchSchema);
  const ws = await prisma.workspace.update({ where: { id: params.id }, data: { name: body.name } });
  return ok({ id: ws.id, name: ws.name });
});
