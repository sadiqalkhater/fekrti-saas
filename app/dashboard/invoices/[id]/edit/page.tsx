'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import InvoiceForm from '@/components/forms/InvoiceForm';
import { apiError } from '@/hooks/useVendor';
import { Invoice } from '@/types';

export default function EditInvoicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get<Invoice>(`/api/invoices/${params.id}`)
      .then((r) => {
        if (r.data.status !== 'DRAFT') setError('لا يمكن تعديل فاتورة بعد إرسالها');
        else setInvoice(r.data);
      })
      .catch((e) => setError(apiError(e, 'خطأ في تحميل الفاتورة')));
  }, [params.id]);

  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!invoice) return <div className="p-8 text-center">جاري التحميل...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-fekrti-navy mb-6">
        تعديل <span dir="ltr">{invoice.invoiceNumber}</span>
      </h1>
      <div className="bg-white p-8 rounded-lg shadow">
        <InvoiceForm initialData={invoice} onSubmit={(updated) => router.push(`/dashboard/invoices/${updated.id}`)} />
      </div>
    </div>
  );
}
