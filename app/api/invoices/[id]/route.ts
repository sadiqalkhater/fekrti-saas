// app/api/invoices/[id]/route.ts
// قراءة فاتورة، تعديل المسودة، أو حذفها

import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody } from '@/lib/masar/http';
import { requireOwnVendor } from '@/lib/vendor';
import { invoiceData, invoiceInput } from '@/lib/invoices';

type Ctx = { params: { id: string } };
export const dynamic = 'force-dynamic';

async function ownInvoice(id: string) {
  const { vendor } = await requireOwnVendor();
  const invoice = await prisma.invoice.findFirst({
    where: { id, vendorId: vendor.id },
    include: { items: { orderBy: { createdAt: 'asc' } }, payments: true },
  });
  if (!invoice) throw new HttpError(404, 'الفاتورة غير موجودة');
  return { vendor, invoice };
}

export const GET = handle(async (_req: Request, { params }: Ctx) => {
  const { invoice } = await ownInvoice(params.id);
  return ok(invoice);
});

export const PUT = handle(async (request: Request, { params }: Ctx) => {
  const { vendor, invoice } = await ownInvoice(params.id);
  if (invoice.status !== 'DRAFT') throw new HttpError(409, 'لا يمكن تعديل فاتورة بعد إرسالها');
  const body = await parseBody(request, invoiceInput);
  const { fields, items } = await invoiceData(vendor.id, body);
  const updated = await prisma.invoice.update({
    where: { id: invoice.id },
    data: { ...fields, items: { deleteMany: {}, create: items } },
    include: { items: true },
  });
  return ok(updated);
});

export const DELETE = handle(async (_req: Request, { params }: Ctx) => {
  const { invoice } = await ownInvoice(params.id);
  if (invoice.status !== 'DRAFT') throw new HttpError(409, 'لا يمكن حذف فاتورة بعد إرسالها. ألغها بدلًا من ذلك.');
  await prisma.invoice.delete({ where: { id: invoice.id } });
  return ok({ ok: true });
});
