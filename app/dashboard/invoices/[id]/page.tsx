'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { apiError } from '@/hooks/useVendor';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { INVOICE_STATUSES } from '@/utils/constants';

export default function InvoiceDetailsPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get<Invoice>(`/api/invoices/${params.id}`)
      .then((r) => setInvoice(r.data))
      .catch((e) => setError(apiError(e, 'خطأ في تحميل الفاتورة')));
  }, [params.id]);

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!invoice) return <div className="p-8 text-center">جاري التحميل...</div>;
  const status = INVOICE_STATUSES[invoice.status as keyof typeof INVOICE_STATUSES];

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex flex-wrap gap-4 justify-between items-start mb-6">
        <div>
          <Link href="/dashboard/invoices" className="text-sm text-fekrti-primary hover:underline">
            → الفواتير
          </Link>
          <h1 className="text-3xl font-bold text-fekrti-navy mt-1" dir="ltr">
            {invoice.invoiceNumber}
          </h1>
          <span className={`inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium ${status.color} ${status.textColor}`}>{status.label}</span>
        </div>
        {invoice.status === 'DRAFT' && (
          <Link href={`/dashboard/invoices/${invoice.id}/edit`} className="bg-fekrti-primary text-white px-5 py-2 rounded-lg hover:bg-fekrti-primary/90">
            تعديل المسودة
          </Link>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-sm text-gray-500 mb-1">العميل</h2>
            <p className="font-bold text-fekrti-navy">{invoice.clientName}</p>
            {invoice.clientEmail && (
              <p className="text-gray-600" dir="ltr">
                {invoice.clientEmail}
              </p>
            )}
            {invoice.clientPhone && (
              <p className="text-gray-600" dir="ltr">
                {invoice.clientPhone}
              </p>
            )}
          </div>
          <div className="md:text-left space-y-1">
            <p>
              <span className="text-gray-500">تاريخ الإصدار: </span>
              {formatDate(invoice.invoiceDate)}
            </p>
            <p>
              <span className="text-gray-500">تاريخ الاستحقاق: </span>
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px]">
            <thead className="border-b text-gray-500 text-sm">
              <tr>
                <th className="py-2 text-right font-medium">الوصف</th>
                <th className="py-2 text-right font-medium">الكمية</th>
                <th className="py-2 text-right font-medium">سعر الوحدة</th>
                <th className="py-2 text-left font-medium">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3">{item.description}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                  <td className="py-3 text-left">{formatCurrency(item.amount, invoice.currency)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mr-auto max-w-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">المجموع قبل الضريبة</span>
            <span>{formatCurrency(invoice.subtotal, invoice.currency)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">الضريبة ({Math.round(invoice.taxRate * 100)}٪)</span>
            <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-lg font-bold text-fekrti-primary">
            <span>الإجمالي</span>
            <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
          </div>
          {invoice.paidAmount > 0 && (
            <div className="flex justify-between text-green-700">
              <span>المدفوع</span>
              <span>{formatCurrency(invoice.paidAmount, invoice.currency)}</span>
            </div>
          )}
        </div>

        {invoice.notes && (
          <div>
            <h2 className="text-sm text-gray-500 mb-1">ملاحظات</h2>
            <p className="whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
