// app/api/favorites/[serviceId]/route.ts

import { prisma } from '@/lib/db';
import { handle, ok, requireUser } from '@/lib/masar/http';

export const DELETE = handle(async (_req: Request, { params }: { params: { serviceId: string } }) => {
  const me = await requireUser();
  await prisma.favorite.deleteMany({ where: { userId: me.id, serviceId: params.serviceId } });
  return ok({ ok: true });
});
