// app/api/masar/boards/[id]/activity/route.ts
// آخر نشاطات اللوحة

import { prisma } from '@/lib/db';
import { handle, ok, requireUser } from '@/lib/masar/http';
import { activityDto, requireBoard } from '@/lib/masar/service';

type Ctx = { params: { id: string } };
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const me = await requireUser();
  await requireBoard(me.id, params.id);
  const items = await prisma.cardActivity.findMany({
    where: { boardId: params.id, card: { archivedAt: null } },
    orderBy: { createdAt: 'desc' },
    take: 40,
    include: { card: { select: { title: true } } },
  });
  return ok({ activity: items.map(activityDto) });
});
