// lib/vendor.ts
// متجر المستخدم الحالي وإحصائياته

import { prisma } from '@/lib/db';
import { HttpError, requireUser } from '@/lib/masar/http';

/** متجر صاحب الجلسة، أو 404 إن لم يكن له متجر */
export async function requireOwnVendor() {
  const me = await requireUser();
  const vendor = await prisma.vendor.findUnique({ where: { userId: me.id } });
  if (!vendor) throw new HttpError(404, 'ليس لديك متجر بعد');
  return { me, vendor };
}

const MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export async function vendorStats(vendorId: string) {
  const since = new Date();
  since.setMonth(since.getMonth() - 5, 1);
  since.setHours(0, 0, 0, 0);

  const [totalProjects, totalServices, totalProposals, totalInvoices, revenue, payments] = await Promise.all([
    prisma.project.count({ where: { vendorId } }),
    prisma.service.count({ where: { vendorId } }),
    prisma.proposal.count({ where: { vendorId } }),
    prisma.invoice.count({ where: { vendorId } }),
    prisma.invoice.aggregate({ where: { vendorId }, _sum: { paidAmount: true } }),
    prisma.invoicePayment.findMany({
      where: { invoice: { vendorId }, paymentDate: { gte: since } },
      select: { amount: true, paymentDate: true },
    }),
  ]);

  // الإيرادات المحصّلة في آخر 6 أشهر من دفعات الفواتير الفعلية
  const monthly = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(since);
    d.setMonth(since.getMonth() + i);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, month: MONTHS[d.getMonth()], revenue: 0 };
  });
  for (const p of payments) {
    const row = monthly.find((m) => m.key === `${p.paymentDate.getFullYear()}-${p.paymentDate.getMonth()}`);
    if (row) row.revenue += p.amount;
  }

  return {
    totalProjects,
    totalServices,
    totalProposals,
    totalInvoices,
    totalRevenue: revenue._sum.paidAmount ?? 0,
    monthlyRevenue: monthly.map(({ month, revenue: r }) => ({ month, revenue: Math.round(r * 100) / 100 })),
  };
}
