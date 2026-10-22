// components/forms/VendorForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Vendor } from '@/types';

const vendorSchema = z.object({
  businessName: z.string().trim().min(2, 'اسم النشاط مطلوب'),
  description: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('البريد غير صحيح').optional().or(z.literal('')),
  website: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional(),
  bankName: z.string().optional(),
  ibanNumber: z.string().optional(),
});

type VendorFormData = z.infer<typeof vendorSchema>;

interface VendorFormProps {
  vendor?: Vendor;
  onSubmit: (data: Partial<Vendor>) => Promise<void>;
}

/** إنشاء متجر (بدون vendor) أو تعديل بياناته */
export default function VendorForm({ vendor, onSubmit }: VendorFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      businessName: vendor?.businessName ?? '',
      description: vendor?.description ?? '',
      phone: vendor?.phone ?? '',
      email: vendor?.email ?? '',
      website: vendor?.website ?? '',
      city: vendor?.city ?? '',
      address: vendor?.address ?? '',
      taxId: vendor?.taxId ?? '',
      bankName: vendor?.bankName ?? '',
      ibanNumber: vendor?.ibanNumber ?? '',
    },
  });

  const submit = async (data: VendorFormData) => {
    setLoading(true);
    try {
      await onSubmit(vendor ? data : { businessName: data.businessName, description: data.description, phone: data.phone, city: data.city });
    } catch {
      // الخطأ يظهر للمستخدم من الدالة المستدعاة
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-6">
      <Input label="اسم النشاط" {...register('businessName')} error={errors.businessName?.message} />
      <div>
        <label className="block text-sm font-medium text-fekrti-navy mb-2" htmlFor="vendor-description">
          نبذة عن النشاط
        </label>
        <textarea
          id="vendor-description"
          rows={4}
          {...register('description')}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fekrti-primary"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="الهاتف" dir="ltr" {...register('phone')} />
        <Input label="المدينة" {...register('city')} />
      </div>
      {vendor && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="البريد الإلكتروني" type="email" dir="ltr" {...register('email')} error={errors.email?.message} />
            <Input label="الموقع الإلكتروني" dir="ltr" {...register('website')} />
          </div>
          <Input label="العنوان" {...register('address')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="الرقم الضريبي" dir="ltr" {...register('taxId')} />
            <Input label="البنك" {...register('bankName')} />
            <Input label="رقم الآيبان" dir="ltr" {...register('ibanNumber')} />
          </div>
        </>
      )}
      <Button type="submit" loading={loading}>
        {vendor ? 'حفظ التغييرات' : 'إنشاء المتجر'}
      </Button>
    </form>
  );
}
