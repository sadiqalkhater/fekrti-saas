// app/api/invoices/route.ts
// API لإدارة فواتير متجر المستخدم الحالي

import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { createWithInvoiceNumber, invoiceData, invoiceInput } from '@/lib/invoices';
import { prisma } from '@/lib/db';
import { handle, HttpError, ok, parseBody } from '@/lib/masar/http';
import { requireOwnVendor } from '@/lib/vendor';

export const dynamic = 'force-dynamic';

const STATUSES = ['DRAFT', 'SENT', 'VIEWED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'] as const;

// ==================== GET /api/invoices ====================

export const GET = handle(async (request: Request) => {
  const { vendor } = await requireOwnVendor();
  const params = new URL(request.url).searchParams;
  const requested = params.get('vendorId');
  if (requested && requested !== vendor.id) throw new HttpError(403, 'لا تملك صلاحية لهذه الفواتير');

  const status = params.get('status');
  const page = Math.max(1, parseInt(params.get('page') || '1') || 1);
  const take = Math.min(100, Math.max(1, parseInt(params.get('take') || '20') || 20));
  const where: Prisma.InvoiceWhereInput = { vendorId: vendor.id };
  if (status && (STATUSES as readonly string[]).includes(status)) where.status = status as (typeof STATUSES)[number];

  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: { items: true, payments: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * take,
      take,
    }),
    prisma.invoice.count({ where }),
  ]);
  return ok({ data: invoices, total, page, pageSize: take, totalPages: Math.ceil(total / take) });
});

// ==================== POST /api/invoices ====================

export const POST = handle(async (request: Request) => {
  const { vendor } = await requireOwnVendor();
  const body = await parseBody(request, invoiceInput.extend({ vendorId: z.string().optional() }));
  if (body.vendorId && body.vendorId !== vendor.id) throw new HttpError(403, 'لا تملك صلاحية لهذا المتجر');

  const { fields, items } = await invoiceData(vendor.id, body);
  const invoice = await createWithInvoiceNumber(vendor.id, (invoiceNumber) =>
    prisma.invoice.create({
      data: { ...fields, vendorId: vendor.id, invoiceNumber, status: 'DRAFT', items: { create: items } },
      include: { items: true },
    }),
  );
  return ok(invoice, 201);
});
