// lib/invoices.ts
// التحقق من بيانات الفاتورة وحساب مبالغها

import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { generateInvoiceNumber } from '@/utils/helpers';
import { HttpError } from '@/lib/masar/http';

export const invoiceInput = z.object({
  projectId: z.string().optional(),
  clientName: z.string().trim().min(2, 'اسم العميل مطلوب').max(120),
  clientEmail: z.string().trim().email('البريد غير صحيح').optional().or(z.literal('')),
  clientPhone: z.string().trim().max(30).optional(),
  dueDate: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  notes: z.string().max(5000).optional(),
  items: z
    .array(
      z.object({
        description: z.string().trim().min(1, 'الوصف مطلوب').max(500),
        quantity: z.number().positive('الكمية أكبر من صفر'),
        unitPrice: z.number().min(0),
      }),
    )
    .min(1, 'يجب إضافة بند واحد على الأقل')
    .max(100),
});

const round = (n: number) => Math.round(n * 100) / 100;

/** يحسب المبالغ ويبني بيانات الفاتورة المشتركة بين الإنشاء والتعديل */
export async function invoiceData(vendorId: string, body: z.infer<typeof invoiceInput>) {
  const dueDate = new Date(body.dueDate);
  if (Number.isNaN(dueDate.getTime())) throw new HttpError(400, 'تاريخ الاستحقاق غير صالح');
  if (body.projectId) {
    const project = await prisma.project.findFirst({ where: { id: body.projectId, vendorId } });
    if (!project) throw new HttpError(404, 'المشروع غير موجود');
  }
  const settings = await prisma.vendorSettings.findUnique({ where: { vendorId } });
  const taxRate = settings?.taxRate ?? 0.15;
  const items = body.items.map((i) => ({ ...i, amount: round(i.quantity * i.unitPrice) }));
  const subtotal = round(items.reduce((s, i) => s + i.amount, 0));
  const taxAmount = round(subtotal * taxRate);
  return {
    fields: {
      projectId: body.projectId || null,
      dueDate,
      clientName: body.clientName,
      clientEmail: body.clientEmail || null,
      clientPhone: body.clientPhone || null,
      notes: body.notes || null,
      subtotal,
      taxRate,
      taxAmount,
      totalAmount: round(subtotal + taxAmount),
      currency: settings?.currency ?? 'SAR',
    },
    items,
  };
}

/**
 * ينشئ فاتورة برقم متسلسل جديد للتاجر. إن كان الرقم مستخدمًا
 * (بعد حذف فاتورة، أو طلبان في الوقت نفسه) نجرّب الرقم التالي.
 */
export async function createWithInvoiceNumber<T>(vendorId: string, create: (invoiceNumber: string) => Promise<T>): Promise<T> {
  let seq = (await prisma.invoice.count({ where: { vendorId } })) + 1;
  for (let attempt = 0; attempt < 20; attempt++, seq++) {
    try {
      return await create(generateInvoiceNumber(vendorId, seq));
    } catch (error) {
      const taken = error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
      if (!taken) throw error;
    }
  }
  throw new HttpError(409, 'تعذّر توليد رقم فاتورة جديد. أعد المحاولة.');
}
