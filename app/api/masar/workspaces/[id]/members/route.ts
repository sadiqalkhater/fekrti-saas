// app/api/masar/workspaces/[id]/members/route.ts
// إضافة عضو إلى مساحة العمل ببريده المسجّل في فكرتي

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';
import { requireWorkspace, workspaceMembers } from '@/lib/masar/service';

type Ctx = { params: { id: string } };

const schema = z.object({
  email: z.string().trim().toLowerCase().email('البريد غير صالح'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']).default('MEMBER'),
});

export const POST = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  await requireWorkspace(me.id, params.id, 'ADMIN');
  const body = await parseBody(request, schema);
  const user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) throw new HttpError(404, 'لا يوجد حساب بهذا البريد. اطلب من زميلك إنشاء حساب في فكرتي أولًا.');
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: params.id, userId: user.id } },
    create: { workspaceId: params.id, userId: user.id, role: body.role },
    update: {},
  });
  return ok({ members: await workspaceMembers(params.id) }, 201);
});
