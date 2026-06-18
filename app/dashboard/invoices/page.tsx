'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useVendor } from '@/hooks/useVendor';
import InvoiceTable from '../components/InvoiceTable';
import { INVOICE_STATUSES } from '@/utils/constants';

export default function InvoicesPage() {
  const { vendor } = useVendor();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!vendor?.id) return;
      try {
        setLoading(true);
        const response = await axios.get('/api/invoices', {
          params: {
            vendorId: vendor.id,
            status: filter || undefined,
          },
        });
        setInvoices(response.data.data);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [vendor?.id, filter]);

  return (
    <div className="p-8">
      {/* الرأس */}
      <div className="flex justify-between items-center mb-8">
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
        <InvoiceTable invoices={invoices} />
      )}
    </div>
  );
}
