// app/api/masar/lists/[id]/route.ts
// إعادة تسمية قائمة، تغيير ترتيبها، أو أرشفتها

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';
import { requireBoard, touchBoard } from '@/lib/masar/service';
import { positionBetween } from '@/lib/masar/shared';

type Ctx = { params: { id: string } };

const schema = z.object({
  title: z.string().trim().min(1).max(60).optional(),
  // ضع القائمة قبل القائمة beforeId، أو في النهاية إن كانت null
  move: z.object({ beforeId: z.string().nullable() }).optional(),
  archived: z.boolean().optional(),
});

export const PATCH = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  const list = await prisma.boardList.findUnique({ where: { id: params.id } });
  if (!list) throw new HttpError(404, 'القائمة غير موجودة');
  await requireBoard(me.id, list.boardId, 'MEMBER');

  let position: number | undefined;
  if (body.move) {
    const others = await prisma.boardList.findMany({
      where: { boardId: list.boardId, archivedAt: null, id: { not: list.id } },
      orderBy: { position: 'asc' },
    });
    const idx = body.move.beforeId ? others.findIndex((l) => l.id === body.move!.beforeId) : -1;
    position = positionBetween(others.map((l) => l.position), idx);
  }
  const updated = await prisma.boardList.update({
    where: { id: list.id },
    data: {
      title: body.title,
      position,
      archivedAt: body.archived === undefined ? undefined : body.archived ? new Date() : null,
    },
  });
  await touchBoard(list.boardId);
  return ok({ id: updated.id, title: updated.title, position: updated.position, archived: !!updated.archivedAt });
});
