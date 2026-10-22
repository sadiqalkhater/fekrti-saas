// components/dashboard/CreateVendor.tsx
'use client';

import Card from '../ui/Card';
import VendorForm from '../forms/VendorForm';
import { Vendor } from '@/types';

/** يظهر لمن ليس لديه متجر بعد */
export default function CreateVendor({ onCreate }: { onCreate: (data: Partial<Vendor>) => Promise<void> }) {
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-fekrti-navy">أنشئ متجرك</h1>
      <p className="text-gray-600 mt-2 mb-6">متجرك في فكرتي يتيح لك إصدار الفواتير وعرض خدماتك في السوق، وتحويل مهام مسار إلى فواتير.</p>
      <Card>
        <VendorForm onSubmit={onCreate} />
      </Card>
    </div>
  );
}
