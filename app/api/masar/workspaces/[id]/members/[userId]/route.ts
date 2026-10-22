// app/api/masar/workspaces/[id]/members/[userId]/route.ts
// تغيير دور عضو أو إزالته

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';
import { requireWorkspace, workspaceMembers } from '@/lib/masar/service';

type Ctx = { params: { id: string; userId: string } };

async function target(workspaceId: string, userId: string) {
  const member = await prisma.workspaceMember.findUnique({ where: { workspaceId_userId: { workspaceId, userId } } });
  if (!member) throw new HttpError(404, 'العضو غير موجود');
  if (member.role === 'OWNER') throw new HttpError(400, 'لا يمكن تغيير دور المالك أو إزالته');
  return member;
}

const schema = z.object({ role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']) });

export const PATCH = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  await requireWorkspace(me.id, params.id, 'ADMIN');
  const body = await parseBody(request, schema);
  const member = await target(params.id, params.userId);
  await prisma.workspaceMember.update({ where: { id: member.id }, data: { role: body.role } });
  return ok({ members: await workspaceMembers(params.id) });
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const me = await requireUser();
  // العضو يستطيع مغادرة المساحة بنفسه، والإزالة لغيره للمشرفين فقط
  await requireWorkspace(me.id, params.id, params.userId === me.id ? 'VIEWER' : 'ADMIN');
  const member = await target(params.id, params.userId);
  await prisma.$transaction([
    prisma.cardAssignee.deleteMany({ where: { userId: params.userId, card: { board: { workspaceId: params.id } } } }),
    prisma.workspaceMember.delete({ where: { id: member.id } }),
  ]);
  return ok({ members: await workspaceMembers(params.id) });
});
