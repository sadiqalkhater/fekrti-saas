// app/api/invoices/route.ts
// API لإدارة الفواتير

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateInvoiceNumber } from '@/utils/helpers';

// ==================== GET /api/invoices ====================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendorId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const take = parseInt(searchParams.get('take') || '10');
    const skip = (page - 1) * take;

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId مطلوب' },
        { status: 400 }
      );
    }

    const where: any = { vendorId };
    if (status) where.status = status;

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { items: true, payments: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.invoice.count({ where }),
    ]);

    return NextResponse.json({
      data: invoices,
      total,
      page,
      pageSize: take,
      totalPages: Math.ceil(total / take),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'خطأ في جلب الفواتير' },
      { status: 500 }
    );
  }
}

// ==================== POST /api/invoices ====================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, projectId, items, clientName, clientEmail, dueDate, notes } = body;

    if (!vendorId || !items || !clientName || !dueDate) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير كاملة' },
        { status: 400 }
      );
    }

    // الحصول على عدد الفواتير لتوليد الرقم
    const count = await prisma.invoice.count({
      where: { vendorId },
    });

    const invoiceNumber = generateInvoiceNumber(vendorId, count + 1);

    // حساب المجموع
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = Math.round(subtotal * 0.15 * 100) / 100;
    const totalAmount = subtotal + taxAmount;

    const invoice = await prisma.invoice.create({
      data: {
        vendorId,
        projectId,
        invoiceNumber,
        invoiceDate: new Date(),
        dueDate: new Date(dueDate),
        clientName,
        clientEmail,
        subtotal,
        taxAmount,
        totalAmount,
        taxRate: 0.15,
        currency: 'SAR',
        notes,
        status: 'DRAFT',
        items: {
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'خطأ في إنشاء الفاتورة' },
      { status: 500 }
    );
  }
}
