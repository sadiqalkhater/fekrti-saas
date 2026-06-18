// components/tables/InvoiceTable.tsx
'use client';

import Link from 'next/link';
import { Invoice } from '@/types';
import { formatDate, formatCurrency } from '@/utils/helpers';
import { INVOICE_STATUSES } from '@/utils/constants';
import DeleteButton from '../ui/DeleteButton';
import EditButton from '../ui/EditButton';

interface InvoiceTableProps {
  invoices: Invoice[];
}

export default function InvoiceTable({ invoices }: InvoiceTableProps) {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="px-6 py-4 text-right font-semibold text-fekrti-navy">رقم الفاتورة</th>
            <th className="px-6 py-4 text-right font-semibold text-fekrti-navy">العميل</th>
            <th className="px-6 py-4 text-right font-semibold text-fekrti-navy">المبلغ</th>
            <th className="px-6 py-4 text-right font-semibold text-fekrti-navy">الحالة</th>
            <th className="px-6 py-4 text-right font-semibold text-fekrti-navy">التاريخ</th>
            <th className="px-6 py-4 text-center font-semibold text-fekrti-navy">الإجراءات</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => {
            const status = INVOICE_STATUSES[invoice.status as keyof typeof INVOICE_STATUSES];
            return (
              <tr key={invoice.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <Link href={`/dashboard/invoices/${invoice.id}`} className="text-fekrti-primary font-semibold hover:underline">
                    {invoice.invoiceNumber}
                  </Link>
                </td>
                <td className="px-6 py-4">{invoice.clientName}</td>
                <td className="px-6 py-4 font-semibold">{formatCurrency(invoice.totalAmount)}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{formatDate(invoice.invoiceDate)}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-center gap-2">
                    <EditButton href={`/dashboard/invoices/${invoice.id}/edit`} />
                    <DeleteButton
                      onDelete={() => {
                        // سيتم تنفيذ الحذف هنا
                        console.log('Delete invoice:', invoice.id);
                      }}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {invoices.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          لا توجد فواتير
        </div>
      )}
    </div>
  );
}
