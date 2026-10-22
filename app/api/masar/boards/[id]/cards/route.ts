// app/api/masar/boards/[id]/cards/route.ts
// إضافة بطاقة في آخر قائمة

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';
import { cardDto, logActivity, requireBoard, touchBoard } from '@/lib/masar/service';
import { POSITION_GAP } from '@/lib/masar/shared';

type Ctx = { params: { id: string } };
const schema = z.object({ listId: z.string().min(1), title: z.string().trim().min(1).max(500) });

export const POST = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  await requireBoard(me.id, params.id, 'MEMBER');
  const body = await parseBody(request, schema);
  const list = await prisma.boardList.findFirst({ where: { id: body.listId, boardId: params.id, archivedAt: null } });
  if (!list) throw new HttpError(404, 'القائمة غير موجودة');
  const last = await prisma.card.findFirst({
    where: { listId: list.id, archivedAt: null },
    orderBy: { position: 'desc' },
  });
  const card = await prisma.card.create({
    data: {
      boardId: params.id,
      listId: list.id,
      title: body.title,
      position: (last?.position ?? 0) + POSITION_GAP,
      createdById: me.id,
    },
    include: { assignees: true },
  });
  await logActivity({ boardId: params.id, cardId: card.id, userId: me.id, text: `أضاف البطاقة إلى «${list.title}»` });
  await touchBoard(params.id);
  return ok(cardDto(card), 201);
});
