// app/api/masar/boards/[id]/route.ts
// قراءة اللوحة كاملة، تعديلها، أو أرشفتها (والتراجع عن الأرشفة)

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, ok, parseBody, requireUser } from '@/lib/masar/http';
import { canWrite, loadBoard, requireBoard } from '@/lib/masar/service';
import { BOARD_COLORS } from '@/lib/masar/shared';

type Ctx = { params: { id: string } };
export const dynamic = 'force-dynamic';

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const me = await requireUser();
  const { role } = await requireBoard(me.id, params.id);
  return ok({ ...(await loadBoard(params.id)), canWrite: canWrite(role) });
});

const schema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  color: z.enum(BOARD_COLORS).optional(),
  archived: z.boolean().optional(),
});

export const PATCH = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  await requireBoard(me.id, params.id, body.archived !== undefined ? 'ADMIN' : 'MEMBER');
  const board = await prisma.board.update({
    where: { id: params.id },
    data: {
      name: body.name,
      color: body.color,
      archivedAt: body.archived === undefined ? undefined : body.archived ? new Date() : null,
    },
  });
  return ok({ id: board.id, name: board.name, color: board.color, archived: !!board.archivedAt });
});
