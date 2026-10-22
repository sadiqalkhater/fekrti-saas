// app/api/vendors/route.ts
// إنشاء متجر للمستخدم الحالي

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';
import { slugify } from '@/utils/helpers';

const schema = z.object({
  businessName: z.string().trim().min(2, 'اسم النشاط قصير').max(120),
  description: z.string().trim().max(5000).optional(),
  phone: z.string().trim().max(30).optional(),
  city: z.string().trim().max(80).optional(),
});

export const POST = handle(async (request: Request) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  if (await prisma.vendor.findUnique({ where: { userId: me.id } })) throw new HttpError(409, 'لديك متجر بالفعل');

  const base = slugify(body.businessName) || 'store';
  const vendor = await prisma.vendor.create({
    data: { ...body, userId: me.id, slug: `${base}-${Math.random().toString(36).slice(2, 7)}` },
  });
  await prisma.user.update({ where: { id: me.id }, data: { role: 'VENDOR' } });

  // اربط أول مساحة عمل يملكها في مسار بالمتجر لتعمل الفواتير من المهام
  const owned = await prisma.workspaceMember.findFirst({
    where: { userId: me.id, role: 'OWNER', workspace: { vendorId: null } },
    orderBy: { createdAt: 'asc' },
  });
  if (owned) await prisma.workspace.update({ where: { id: owned.workspaceId }, data: { vendorId: vendor.id } });

  return ok(vendor, 201);
});
