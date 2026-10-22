// app/api/masar/boards/[id]/lists/route.ts
// إضافة قائمة في آخر اللوحة

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, ok, parseBody, requireUser } from '@/lib/masar/http';
import { requireBoard, touchBoard } from '@/lib/masar/service';
import { POSITION_GAP } from '@/lib/masar/shared';

type Ctx = { params: { id: string } };
const schema = z.object({ title: z.string().trim().min(1).max(60) });

export const POST = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  await requireBoard(me.id, params.id, 'MEMBER');
  const body = await parseBody(request, schema);
  const last = await prisma.boardList.findFirst({
    where: { boardId: params.id, archivedAt: null },
    orderBy: { position: 'desc' },
  });
  const list = await prisma.boardList.create({
    data: { boardId: params.id, title: body.title, position: (last?.position ?? 0) + POSITION_GAP },
  });
  await touchBoard(params.id);
  return ok({ id: list.id, title: list.title, position: list.position }, 201);
});
