// app/api/masar/boards/route.ts
// إنشاء لوحة جديدة بقوائمها

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, ok, parseBody, requireUser } from '@/lib/masar/http';
import { requireWorkspace } from '@/lib/masar/service';
import { BOARD_COLORS, POSITION_GAP } from '@/lib/masar/shared';

const schema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().trim().min(1).max(80),
  lists: z.array(z.string().trim().min(1).max(60)).min(1).max(12),
});

export const POST = handle(async (request: Request) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  await requireWorkspace(me.id, body.workspaceId, 'MEMBER');
  const count = await prisma.board.count({ where: { workspaceId: body.workspaceId } });
  const board = await prisma.board.create({
    data: {
      workspaceId: body.workspaceId,
      name: body.name,
      color: BOARD_COLORS[count % BOARD_COLORS.length],
      createdById: me.id,
      lists: { create: body.lists.map((title, i) => ({ title, position: (i + 1) * POSITION_GAP })) },
    },
  });
  return ok({ id: board.id, name: board.name, color: board.color }, 201);
});
