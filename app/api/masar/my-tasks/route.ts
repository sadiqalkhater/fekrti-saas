// app/api/masar/my-tasks/route.ts
// المهام المسندة إليّ في كل اللوحات

import { prisma } from '@/lib/db';
import { handle, ok, requireUser } from '@/lib/masar/http';
import { cardDto } from '@/lib/masar/service';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const me = await requireUser();
  const cards = await prisma.card.findMany({
    where: {
      archivedAt: null,
      done: false,
      assignees: { some: { userId: me.id } },
      list: { archivedAt: null },
      board: { archivedAt: null, workspace: { members: { some: { userId: me.id } } } },
    },
    include: {
      assignees: true,
      board: { select: { name: true, color: true } },
      list: { select: { title: true } },
    },
    orderBy: [{ dueDate: { sort: 'asc', nulls: 'last' } }, { updatedAt: 'desc' }],
    take: 300,
  });
  return ok({
    cards: cards.map((c) => ({ ...cardDto(c), boardName: c.board.name, boardColor: c.board.color, listTitle: c.list.title })),
  });
});
