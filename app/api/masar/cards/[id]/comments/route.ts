// app/api/masar/cards/[id]/comments/route.ts
// إضافة تعليق على بطاقة وإشعار المسؤولين عنها

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, ok, parseBody, requireUser } from '@/lib/masar/http';
import { activityDto, logActivity, notify, requireCard, touchBoard } from '@/lib/masar/service';

type Ctx = { params: { id: string } };
const schema = z.object({ text: z.string().trim().min(1).max(4000) });

export const POST = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  const { card, board } = await requireCard(me.id, params.id, 'MEMBER');
  const created = await logActivity({ boardId: board.id, cardId: card.id, userId: me.id, text: body.text, kind: 'COMMENT' });
  await touchBoard(board.id);
  await notify({
    actor: me,
    to: [...card.assignees.map((a) => a.userId), card.createdById],
    type: 'TASK_COMMENT',
    title: `${me.name} علّق على «${card.title}»`,
    message: body.text.slice(0, 200),
    boardId: board.id,
    cardId: card.id,
  });
  const full = await prisma.cardActivity.findUniqueOrThrow({
    where: { id: created.id },
    include: { card: { select: { title: true } } },
  });
  return ok(activityDto(full), 201);
});
