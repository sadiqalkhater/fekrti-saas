// app/api/vendors/me/route.ts
// متجر المستخدم الحالي مع إحصائياته

import { prisma } from '@/lib/db';
import { handle, ok } from '@/lib/masar/http';
import { requireOwnVendor, vendorStats } from '@/lib/vendor';

export const dynamic = 'force-dynamic';

export const GET = handle(async () => {
  const { vendor } = await requireOwnVendor();
  const [stats, topServices] = await Promise.all([
    vendorStats(vendor.id),
    prisma.service.findMany({ where: { vendorId: vendor.id }, orderBy: { orderCount: 'desc' }, take: 5 }),
  ]);
  return ok({ vendor, stats, topServices });
});
