// app/api/favorites/route.ts
// مفضلة المستخدم الحالي

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  // الزائر غير المسجّل ليس له مفضلة
  const userId = await getSessionUserId();
  if (!userId) return ok([]);
  const favorites = await prisma.favorite.findMany({ where: { userId }, select: { serviceId: true } });
  return ok(favorites);
});

export const POST = handle(async (request: Request) => {
  const me = await requireUser();
  const { serviceId } = await parseBody(request, z.object({ serviceId: z.string().min(1) }));
  if (!(await prisma.service.findUnique({ where: { id: serviceId } }))) throw new HttpError(404, 'الخدمة غير موجودة');
  await prisma.favorite.upsert({
    where: { userId_serviceId: { userId: me.id, serviceId } },
    create: { userId: me.id, serviceId },
    update: {},
  });
  return ok({ serviceId }, 201);
});
