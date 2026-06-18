// components/forms/InvoiceForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axios from 'axios';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { Invoice } from '@/types';

// التحقق
const invoiceSchema = z.object({
  clientName: z.string().min(2, 'اسم العميل مطلوب'),
  clientEmail: z.string().email('البريد غير صحيح').optional().or(z.literal('')),
  clientPhone: z.string().optional(),
  dueDate: z.string().min(1, 'تاريخ الاستحقاق مطلوب'),
  items: z.array(
    z.object({
      description: z.string().min(1, 'الوصف مطلوب'),
      quantity: z.number().min(1),
      unitPrice: z.number().min(0),
    })
  ).min(1, 'يجب إضافة بند واحد على الأقل'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  vendorId: string;
  projectId?: string;
  initialData?: Invoice;
  onSubmit?: (invoice: Invoice) => void;
}

export default function InvoiceForm({
  vendorId,
  projectId,
  initialData,
  onSubmit,
}: InvoiceFormProps) {
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData
      ? {
          clientName: initialData.clientName,
          clientEmail: initialData.clientEmail,
          clientPhone: initialData.clientPhone,
          dueDate: initialData.dueDate.toString().split('T')[0],
          items: initialData.items,
        }
      : {
          items: [{ description: '', quantity: 1, unitPrice: 0 }],
        },
  });

  const [loading, setLoading] = useState(false);
  const items = watch('items');

  const handleFormSubmit = async (data: InvoiceFormData) => {
    setLoading(true);
    try {
      const payload = {
        ...data,
        vendorId,
        projectId,
      };

      const url = initialData ? `/api/invoices/${initialData.id}` : '/api/invoices';
      const method = initialData ? 'PUT' : 'POST';

      const response = await axios[method as 'post' | 'put'](url, payload);
      
      toast.success(initialData ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح');
      reset();
      
      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'حدث خطأ');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0);
  const taxAmount = Math.round(totalAmount * 0.15 * 100) / 100;
  const finalAmount = totalAmount + taxAmount;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* بيانات العميل */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-fekrti-navy">بيانات العميل</h2>
        
        <Input
          label="اسم العميل"
          {...register('clientName')}
          error={errors.clientName?.message}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="البريد الإلكتروني (اختياري)"
            type="email"
            {...register('clientEmail')}
            error={errors.clientEmail?.message}
          />
          <Input
            label="الهاتف (اختياري)"
            {...register('clientPhone')}
            error={errors.clientPhone?.message}
          />
        </div>

        <Input
          label="تاريخ الاستحقاق"
          type="date"
          {...register('dueDate')}
          error={errors.dueDate?.message}
        />
      </div>

      {/* البنود */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-fekrti-navy">البنود</h2>
        
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-end">
            <Input
              label={index === 0 ? 'الوصف' : ''}
              {...register(`items.${index}.description`)}
              className="col-span-6"
            />
            <Input
              label={index === 0 ? 'الكمية' : ''}
              type="number"
              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
              className="col-span-2"
            />
            <Input
              label={index === 0 ? 'السعر' : ''}
              type="number"
              {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
              className="col-span-4"
            />
          </div>
        ))}

        <Button type="button" variant="secondary" size="sm">
          + إضافة بند
        </Button>
      </div>

      {/* الملخص المالي */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-2">
        <div className="flex justify-between text-lg">
          <span>الإجمالي:</span>
          <span className="font-bold">{totalAmount.toLocaleString('ar-SA')} ر.س</span>
        </div>
        <div className="flex justify-between text-lg">
          <span>الضريبة (15%):</span>
          <span className="font-bold">{taxAmount.toLocaleString('ar-SA')} ر.س</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-xl font-bold text-fekrti-primary">
          <span>المجموع الكلي:</span>
          <span>{finalAmount.toLocaleString('ar-SA')} ر.س</span>
        </div>
      </div>

      {/* الأزرار */}
      <div className="flex gap-4">
        <Button type="submit" loading={loading}>
          {initialData ? '💾 حفظ التغييرات' : '➕ إنشاء فاتورة'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => reset()}>
          إعادة تعيين
        </Button>
      </div>
    </form>
  );
}
