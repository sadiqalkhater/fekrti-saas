// app/api/masar/cards/[id]/invoice/route.ts
// تحويل مهمة إلى مسودة فاتورة في فكرتي (ضريبة 15٪)

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody, requireUser } from '@/lib/masar/http';
import { logActivity, requireCard, touchBoard } from '@/lib/masar/service';
import { createWithInvoiceNumber } from '@/lib/invoices';

type Ctx = { params: { id: string } };

const schema = z.object({
  clientName: z.string().trim().min(1).max(120),
  amount: z.number().positive().max(100_000_000),
  description: z.string().trim().max(500).optional(),
});

export const POST = handle(async (request: Request, { params }: Ctx) => {
  const me = await requireUser();
  const body = await parseBody(request, schema);
  const { card, board } = await requireCard(me.id, params.id, 'MEMBER');
  if (card.invoiceId) throw new HttpError(409, 'لهذه البطاقة فاتورة بالفعل');
  const workspace = await prisma.workspace.findUniqueOrThrow({ where: { id: board.workspaceId } });
  if (!workspace.vendorId) {
    throw new HttpError(400, 'هذه المساحة غير مربوطة بمتجر في فكرتي، فلا يمكن إصدار فواتير منها');
  }
  const settings = await prisma.vendorSettings.findUnique({ where: { vendorId: workspace.vendorId } });
  const taxRate = settings?.taxRate ?? 0.15;
  const subtotal = Math.round(body.amount * 100) / 100;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14);

  const vendorId = workspace.vendorId;
  const invoice = await createWithInvoiceNumber(vendorId, (invoiceNumber) => prisma.invoice.create({
    data: {
      vendorId,
      invoiceNumber,
      dueDate,
      clientName: body.clientName,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount: subtotal + taxAmount,
      currency: settings?.currency ?? 'SAR',
      notes: `من مهمة مسار: ${card.title}`,
      items: {
        create: [{ description: body.description || card.title, quantity: 1, unitPrice: subtotal, amount: subtotal }],
      },
      cards: { connect: { id: card.id } },
    },
  }));
  await logActivity({
    boardId: board.id,
    cardId: card.id,
    userId: me.id,
    text: `أنشأ مسودة الفاتورة ${invoice.invoiceNumber} بمبلغ ${invoice.totalAmount.toFixed(2)} ${invoice.currency}`,
  });
  await touchBoard(board.id);
  return ok({ id: invoice.id, invoiceNumber: invoice.invoiceNumber, totalAmount: invoice.totalAmount, currency: invoice.currency }, 201);
});
