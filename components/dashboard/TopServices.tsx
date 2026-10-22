// components/dashboard/TopServices.tsx
'use client';

import Card from '../ui/Card';
import { Service } from '@/types';
import { formatCurrency } from '@/utils/helpers';

export default function TopServices({ services }: { services: Service[] }) {
  return (
    <Card title="أكثر الخدمات طلبًا">
      {services.length === 0 ? (
        <p className="text-gray-500">لم تضف خدمات بعد.</p>
      ) : (
        <ul className="divide-y">
          {services.map((s) => (
            <li key={s.id} className="py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-fekrti-navy truncate">{s.title}</p>
                <p className="text-sm text-gray-600">
                  {s.orderCount} طلب · ⭐ {s.rating.toFixed(1)}
                </p>
              </div>
              <span className="font-semibold whitespace-nowrap">{formatCurrency(s.price, s.currency)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
