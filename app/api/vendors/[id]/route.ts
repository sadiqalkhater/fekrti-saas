// app/api/vendors/[id]/route.ts
// صفحة التاجر العامة، وتحديث بياناته أو حذفه لصاحبه فقط

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { getSessionUserId } from '@/lib/auth';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';

type Ctx = { params: { id: string } };
export const dynamic = 'force-dynamic';

// ==================== GET /api/vendors/[id] ====================

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const vendor = await prisma.vendor.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, avatar: true } },
      services: { where: { status: 'ACTIVE' }, take: 5 },
      reviews: { take: 5, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!vendor) throw new HttpError(404, 'التاجر غير موجود');

  // البيانات البنكية والضريبية لصاحب المتجر فقط
  if ((await getSessionUserId()) !== vendor.userId) {
    const { bankName: _b, accountNumber: _a, ibanNumber: _i, taxId: _t, ...publicVendor } = vendor;
    return ok(publicVendor);
  }
  return ok(vendor);
});

// ==================== PUT /api/vendors/[id] ====================

const optional = (max: number) => z.string().trim().max(max).optional().nullable();
const schema = z.object({
  businessName: z.string().trim().min(2, 'اسم النشاط قصير').max(120).optional(),
  description: optional(5000),
  phone: optional(30),
  email: z.string().trim().email('البريد غير صحيح').optional().nullable().or(z.literal('')),
  website: optional(200),
  address: optional(300),
  city: optional(80),
  country: z.string().trim().length(2).optional(),
  taxId: optional(30),
  bankName: optional(80),
  accountNumber: optional(40),
  ibanNumber: optional(40),
  logo: optional(500),
  banner: optional(500),
});

async function ownVendor(id: string) {
  const me = await requireUser();
  const vendor = await prisma.vendor.findUnique({ where: { id } });
  if (!vendor) throw new HttpError(404, 'التاجر غير موجود');
  if (vendor.userId !== me.id) throw new HttpError(403, 'لا تملك صلاحية لهذا المتجر');
  return vendor;
}

export const PUT = handle(async (request: Request, { params }: Ctx) => {
  await ownVendor(params.id);
  const body = await parseBody(request, schema);
  const data = Object.fromEntries(Object.entries(body).map(([k, v]) => [k, v === '' ? null : v]));
  const updated = await prisma.vendor.update({ where: { id: params.id }, data });
  return ok(updated);
});

// ==================== DELETE /api/vendors/[id] ====================

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  await ownVendor(params.id);
  await prisma.vendor.delete({ where: { id: params.id } });
  return ok({ message: 'تم حذف المتجر بنجاح' });
});
