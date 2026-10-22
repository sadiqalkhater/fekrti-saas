'use client';

import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiError, useVendor } from '@/hooks/useVendor';
import InvoiceTable from '@/components/tables/InvoiceTable';
import CreateVendor from '@/components/dashboard/CreateVendor';
import { INVOICE_STATUSES } from '@/utils/constants';
import { Invoice } from '@/types';

export default function InvoicesPage() {
  const { vendor, hasVendor, loading: vendorLoading, createVendor } = useVendor();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchInvoices = useCallback(async () => {
    if (!vendor?.id) return;
    try {
      setLoading(true);
      const response = await axios.get('/api/invoices', {
        params: { status: filter || undefined, take: 100 },
      });
      setInvoices(response.data.data);
    } catch (error) {
      toast.error(apiError(error, 'خطأ في جلب الفواتير'));
    } finally {
      setLoading(false);
    }
  }, [vendor?.id, filter]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const deleteInvoice = async (id: string) => {
    try {
      await axios.delete(`/api/invoices/${id}`);
      setInvoices((list) => list.filter((i) => i.id !== id));
    } catch (error) {
      // DeleteButton يعرض رسالة هذا الخطأ
      throw new Error(apiError(error, 'خطأ في الحذف'));
    }
  };

  if (!vendorLoading && !hasVendor) return <CreateVendor onCreate={createVendor} />;

  return (
    <div className="p-8">
      {/* الرأس */}
      <div className="flex flex-wrap gap-4 justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-fekrti-navy">الفواتير</h1>
          <p className="text-gray-600 mt-1">إدارة فواتيرك وتتبع المدفوعات</p>
        </div>
        <Link
          href="/dashboard/invoices/new"
          className="bg-fekrti-primary text-white px-6 py-2 rounded-lg hover:bg-fekrti-primary/90 transition"
        >
          + فاتورة جديدة
        </Link>
      </div>

      {/* الفلاتر */}
      <div className="mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilter('')}
          className={`px-4 py-2 rounded-lg transition ${
            filter === '' ? 'bg-fekrti-primary text-white' : 'bg-gray-200 text-fekrti-navy'
          }`}
        >
          الكل
        </button>
        {Object.entries(INVOICE_STATUSES).map(([key, value]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === key ? 'bg-fekrti-primary text-white' : 'bg-gray-200 text-fekrti-navy'
            }`}
          >
            {value.label}
          </button>
        ))}
      </div>

      {/* جدول الفواتير */}
      {loading ? (
        <div className="text-center py-12">جاري التحميل...</div>
      ) : (
        <InvoiceTable invoices={invoices} onDelete={deleteInvoice} />
      )}
    </div>
  );
}
