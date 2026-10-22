// app/api/masar/ai/board/route.ts
// إنشاء لوحة كاملة من وصف المشروع بالذكاء الاصطناعي

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, ok, parseBody, requireUser } from '@/lib/masar/http';
import { requireWorkspace, ymdToDate } from '@/lib/masar/service';
import { generateBoard } from '@/lib/masar/ai';
import { addDays, BOARD_COLORS, LABEL_IDS, POSITION_GAP, ymd } from '@/lib/masar/shared';

export const maxDuration = 120;
const schema = z.object({ workspaceId: z.string().min(1), description: z.string().trim().min(10, 'اكتب وصفًا أطول قليلًا').max(3000) });

export const POST = handle(async (request: Request) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  await requireWorkspace(me.id, body.workspaceId, 'MEMBER');
  const plan = await generateBoard(body.description, ymd(new Date()));

  const lists = plan.lists.map((t) => t.slice(0, 60));
  const count = await prisma.board.count({ where: { workspaceId: body.workspaceId } });
  const board = await prisma.$transaction(async (tx) => {
    const b = await tx.board.create({
      data: {
        workspaceId: body.workspaceId,
        name: plan.name.slice(0, 80) || 'لوحة جديدة',
        color: BOARD_COLORS[count % BOARD_COLORS.length],
        createdById: me.id,
        lists: { create: lists.map((title, i) => ({ title, position: (i + 1) * POSITION_GAP })) },
      },
      include: { lists: { orderBy: { position: 'asc' } } },
    });
    let position = 0;
    for (const c of plan.cards) {
      const list = b.lists[Math.max(0, Math.min(b.lists.length - 1, c.list))];
      const days = c.dueInDays && c.dueInDays > 0 ? Math.min(365, c.dueInDays) : null;
      await tx.card.create({
        data: {
          boardId: b.id,
          listId: list.id,
          title: c.title.slice(0, 500),
          description: c.description.slice(0, 2000),
          labels: LABEL_IDS.filter((l) => c.labels.includes(l)).slice(0, 3),
          dueDate: days ? ymdToDate(addDays(days)) : null,
          checklist: c.checklist.slice(0, 8).map((text, i) => ({ id: `s${i}`, text: text.slice(0, 200), done: false })),
          position: (position += POSITION_GAP),
          createdById: me.id,
        },
      });
    }
    return b;
  });
  return ok({ id: board.id, name: board.name, color: board.color }, 201);
});
