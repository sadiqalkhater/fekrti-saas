'use client';

import { useRouter } from 'next/navigation';
import InvoiceForm from '@/components/forms/InvoiceForm';
import CreateVendor from '@/components/dashboard/CreateVendor';
import { useVendor } from '@/hooks/useVendor';

export default function NewInvoicePage() {
  const router = useRouter();
  const { hasVendor, loading, createVendor } = useVendor();
  if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
  if (!hasVendor) return <CreateVendor onCreate={createVendor} />;
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-fekrti-navy mb-6">فاتورة جديدة</h1>
      <div className="bg-white p-8 rounded-lg shadow">
        <InvoiceForm onSubmit={(invoice) => router.push(`/dashboard/invoices/${invoice.id}`)} />
      </div>
    </div>
  );
}
