// components/forms/InvoiceForm.tsx
'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import axios from 'axios';
import { apiError } from '@/hooks/useVendor';
import { formatCurrency } from '@/utils/helpers';
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
      quantity: z.number({ invalid_type_error: 'أدخل رقمًا' }).positive('الكمية أكبر من صفر'),
      unitPrice: z.number({ invalid_type_error: 'أدخل رقمًا' }).min(0, 'السعر لا يكون سالبًا'),
    })
  ).min(1, 'يجب إضافة بند واحد على الأقل'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().slice(0, 10);
}

interface InvoiceFormProps {
  projectId?: string;
  initialData?: Invoice;
  onSubmit?: (invoice: Invoice) => void;
}

export default function InvoiceForm({
  projectId,
  initialData,
  onSubmit,
}: InvoiceFormProps) {
  const { register, handleSubmit, watch, control, formState: { errors }, reset } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: initialData
      ? {
          clientName: initialData.clientName,
          clientEmail: initialData.clientEmail ?? '',
          clientPhone: initialData.clientPhone ?? '',
          dueDate: initialData.dueDate.toString().split('T')[0],
          items: initialData.items.map((i) => ({ description: i.description, quantity: i.quantity, unitPrice: i.unitPrice })),
        }
      : {
          dueDate: defaultDueDate(),
          items: [{ description: '', quantity: 1, unitPrice: 0 }],
        },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const [loading, setLoading] = useState(false);
  const items = watch('items');

  const handleFormSubmit = async (data: InvoiceFormData) => {
    setLoading(true);
    try {
      const payload = { ...data, projectId };

      const response = initialData
        ? await axios.put<Invoice>(`/api/invoices/${initialData.id}`, payload)
        : await axios.post<Invoice>('/api/invoices', payload);
      
      toast.success(initialData ? 'تم التحديث بنجاح' : 'تم الإنشاء بنجاح');

      if (onSubmit) {
        onSubmit(response.data);
      }
    } catch (error) {
      toast.error(apiError(error, 'حدث خطأ'));
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = Math.round(items.reduce((sum, item) => sum + (item.quantity * item.unitPrice || 0), 0) * 100) / 100;
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        
        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
            <div className="col-span-12 md:col-span-6">
              <Input
                label={index === 0 ? 'الوصف' : undefined}
                aria-label="الوصف"
                {...register(`items.${index}.description`)}
                error={errors.items?.[index]?.description?.message}
              />
            </div>
            <div className="col-span-4 md:col-span-2">
              <Input
                label={index === 0 ? 'الكمية' : undefined}
                aria-label="الكمية"
                type="number"
                step="any"
                {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                error={errors.items?.[index]?.quantity?.message}
              />
            </div>
            <div className="col-span-6 md:col-span-3">
              <Input
                label={index === 0 ? 'سعر الوحدة' : undefined}
                aria-label="سعر الوحدة"
                type="number"
                step="0.01"
                {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                error={errors.items?.[index]?.unitPrice?.message}
              />
            </div>
            <div className={`col-span-2 md:col-span-1 ${index === 0 ? 'pt-8' : ''}`}>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="px-2 py-2 text-red-600 hover:bg-red-50 rounded" aria-label="حذف البند">
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
        {errors.items?.message && <p className="text-red-500 text-sm">{errors.items.message}</p>}

        <Button type="button" variant="secondary" size="sm" onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}>
          + إضافة بند
        </Button>
      </div>

      {/* الملخص المالي */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-2">
        <div className="flex justify-between text-lg">
          <span>المجموع قبل الضريبة:</span>
          <span className="font-bold">{formatCurrency(totalAmount)}</span>
        </div>
        <div className="flex justify-between text-lg">
          <span>الضريبة (15%):</span>
          <span className="font-bold">{formatCurrency(taxAmount)}</span>
        </div>
        <div className="border-t pt-2 flex justify-between text-xl font-bold text-fekrti-primary">
          <span>المجموع الكلي:</span>
          <span>{formatCurrency(finalAmount)}</span>
        </div>
      </div>

      {/* الأزرار */}
      <div className="flex gap-4">
        <Button type="submit" loading={loading}>
          {initialData ? '💾 حفظ التغييرات' : '➕ إنشاء فاتورة'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => reset()}>
          تراجع عن التغييرات
        </Button>
      </div>
    </form>
  );
}
