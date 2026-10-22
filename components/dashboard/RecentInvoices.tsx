// components/dashboard/RecentInvoices.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Card from '../ui/Card';
import { Invoice } from '@/types';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { INVOICE_STATUSES } from '@/utils/constants';

export default function RecentInvoices() {
  const [invoices, setInvoices] = useState<Invoice[] | null>(null);

  useEffect(() => {
    axios
      .get<{ data: Invoice[] }>('/api/invoices', { params: { take: 5 } })
      .then((r) => setInvoices(r.data.data))
      .catch(() => setInvoices([]));
  }, []);

  return (
    <Card title="أحدث الفواتير">
      {invoices === null ? (
        <p className="text-gray-500">جاري التحميل...</p>
      ) : invoices.length === 0 ? (
        <p className="text-gray-500">
          لا توجد فواتير بعد.{' '}
          <Link href="/dashboard/invoices/new" className="text-fekrti-primary font-semibold">
            أنشئ أول فاتورة
          </Link>
        </p>
      ) : (
        <ul className="divide-y">
          {invoices.map((inv) => {
            const status = INVOICE_STATUSES[inv.status as keyof typeof INVOICE_STATUSES];
            return (
              <li key={inv.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Link href={`/dashboard/invoices/${inv.id}`} className="font-semibold text-fekrti-primary hover:underline">
                    {inv.invoiceNumber}
                  </Link>
                  <p className="text-sm text-gray-600 truncate">
                    {inv.clientName} · {formatDate(inv.invoiceDate)}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color} ${status.textColor}`}>{status.label}</span>
                <span className="font-semibold whitespace-nowrap">{formatCurrency(inv.totalAmount)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
