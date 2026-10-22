// app/api/masar/cards/[id]/route.ts
// قراءة بطاقة مع سجلها، وتعديلها (النقل، الإسناد، الإنجاز، الأرشفة…)

import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';
import {
  activityDto,
  cardDto,
  dateToYmd,
  logActivity,
  notify,
  requireCard,
  touchBoard,
  ymdToDate,
} from '@/lib/masar/service';
import { LABEL_IDS, positionBetween } from '@/lib/masar/shared';

type Ctx = { params: { id: string } };
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const me = await requireUser();
  const { card } = await requireCard(me.id, params.id);
  const activity = await prisma.cardActivity.findMany({
    where: { cardId: card.id },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { card: { select: { title: true } } },
  });
  return ok({ card: cardDto(card), activity: activity.map(activityDto) });
});

const schema = z.object({
  title: z.string().trim().min(1).max(500).optional(),
  description: z.string().max(20000).optional(),
  labels: z
    .array(z.string())
    .max(LABEL_IDS.length)
    .refine((ls) => ls.every((l) => LABEL_IDS.includes(l)), 'تصنيف غير معروف')
    .optional(),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  done: z.boolean().optional(),
  checklist: z
    .array(z.object({ id: z.string().min(1).max(40), text: z.string().trim().min(1).max(500), done: z.boolean() }))
    .max(100)
    .optional(),
  assignees: z.array(z.string()).max(20).optional(),
  // انقل البطاقة إلى listId قبل البطاقة beforeId (أو في آخر القائمة)
  move: z.object({ listId: z.string().min(1), beforeId: z.string().nullable() }).optional(),
  archived: z.boolean().optional(),
});

export const PATCH = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  const { card, board } = await requireCard(me.id, params.id, 'MEMBER');

  const data: Prisma.CardUncheckedUpdateInput = {};
  const logs: string[] = [];
  const before = { assignees: card.assignees.map((a) => a.userId) };

  if (body.title !== undefined && body.title !== card.title) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.labels !== undefined) data.labels = LABEL_IDS.filter((l) => body.labels!.includes(l));
  if (body.checklist !== undefined) data.checklist = body.checklist;
  if (body.due !== undefined && body.due !== dateToYmd(card.dueDate)) {
    data.dueDate = ymdToDate(body.due);
    logs.push(body.due ? `حدّد موعد الاستحقاق ${body.due}` : 'أزال موعد الاستحقاق');
  }
  if (body.done !== undefined && body.done !== card.done) {
    data.done = body.done;
    logs.push(body.done ? 'علّم البطاقة كمنجزة' : 'أعاد فتح البطاقة');
  }
  if (body.archived !== undefined) {
    data.archivedAt = body.archived ? new Date() : null;
    logs.push(body.archived ? 'أرشف البطاقة' : 'استعاد البطاقة من الأرشيف');
  }

  let movedTo: string | null = null;
  if (body.move) {
    const target = await prisma.boardList.findFirst({ where: { id: body.move.listId, boardId: board.id, archivedAt: null } });
    if (!target) throw new HttpError(404, 'القائمة غير موجودة');
    const siblings = await prisma.card.findMany({
      where: { listId: target.id, archivedAt: null, id: { not: card.id } },
      orderBy: { position: 'asc' },
      select: { id: true, position: true },
    });
    const idx = body.move.beforeId ? siblings.findIndex((c) => c.id === body.move!.beforeId) : -1;
    data.position = positionBetween(siblings.map((c) => c.position), idx);
    if (target.id !== card.listId) {
      const from = await prisma.boardList.findUnique({ where: { id: card.listId } });
      data.listId = target.id;
      movedTo = target.title;
      logs.push(`نقل البطاقة من «${from?.title ?? ''}» إلى «${target.title}»`);
    }
  }

  let added: string[] = [];
  if (body.assignees !== undefined) {
    const wanted = Array.from(new Set(body.assignees));
    const valid = await prisma.workspaceMember.findMany({
      where: { workspaceId: board.workspaceId, userId: { in: wanted } },
      include: { user: { select: { id: true, name: true } } },
    });
    if (valid.length !== wanted.length) throw new HttpError(400, 'لا يمكن الإسناد إلا لأعضاء المساحة');
    added = wanted.filter((id) => !before.assignees.includes(id));
    const removed = before.assignees.filter((id) => !wanted.includes(id));
    const nameOf = (id: string) => valid.find((v) => v.userId === id)?.user.name ?? 'عضو';
    for (const id of added) logs.push(id === me.id ? 'انضم إلى البطاقة' : `أسند البطاقة إلى ${nameOf(id)}`);
    if (removed.length) {
      const removedUsers = await prisma.user.findMany({ where: { id: { in: removed } }, select: { id: true, name: true } });
      for (const u of removedUsers) logs.push(u.id === me.id ? 'غادر البطاقة' : `أزال ${u.name} من البطاقة`);
    }
    data.assignees = {
      deleteMany: removed.length ? { userId: { in: removed } } : undefined,
      create: added.map((userId) => ({ userId })),
    };
  }

  const updated = await prisma.card.update({ where: { id: card.id }, data, include: { assignees: true } });
  for (const text of logs) await logActivity({ boardId: board.id, cardId: card.id, userId: me.id, text });
  await touchBoard(board.id);

  const ref = { actor: me, boardId: board.id, cardId: card.id, message: updated.title };
  if (added.length) {
    await notify({ ...ref, to: added, type: 'TASK_ASSIGNED', title: `${me.name} أسندك إلى بطاقة` });
  }
  const watchers = updated.assignees.map((a) => a.userId).filter((id) => !added.includes(id));
  if (movedTo) await notify({ ...ref, to: watchers, type: 'TASK_UPDATED', title: `${me.name} نقل بطاقة إلى «${movedTo}»` });
  if (body.done === true && !card.done) {
    await notify({ ...ref, to: [...watchers, card.createdById], type: 'TASK_UPDATED', title: `${me.name} أنجز بطاقة` });
  }
  return ok(cardDto(updated));
});
