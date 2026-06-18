'use client';

import { useEffect, useState } from 'react';
import { useVendor } from '@/hooks/useVendor';
import VendorForm from '../components/VendorForm';

export default function VendorProfilePage() {
  const { vendor, updateVendor, loading } = useVendor();

  if (loading || !vendor) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* الرأس */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-fekrti-navy">ملفك الشخصي</h1>
        <p className="text-gray-600 mt-2">تحديث بيانات عملك والتفاصيل المهمة</p>
      </div>

      {/* نموذج البيانات */}
      <div className="bg-white p-8 rounded-lg shadow">
        <VendorForm vendor={vendor} onSubmit={updateVendor} />
      </div>

      {/* معلومات إضافية */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="font-bold text-fekrti-navy mb-2">📊 التقييم</h3>
          <p className="text-2xl font-bold text-fekrti-primary">{vendor.rating.toFixed(1)}</p>
          <p className="text-gray-600 text-sm">من {vendor.reviewCount} تقييم</p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="font-bold text-fekrti-navy mb-2">💰 الإيرادات الإجمالية</h3>
          <p className="text-2xl font-bold text-green-600">
            {vendor.totalEarnings.toLocaleString('ar-SA')} ر.س
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="font-bold text-fekrti-navy mb-2">📦 الخدمات</h3>
          <p className="text-2xl font-bold text-purple-600">{vendor.totalServices}</p>
          <p className="text-gray-600 text-sm">خدمة نشطة</p>
        </div>
      </div>
    </div>
  );
}
