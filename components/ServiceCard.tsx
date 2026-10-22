
// components/ServiceCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Service } from '@/types';
import { formatCurrency } from '@/utils/helpers';

interface ServiceCardProps {
  service: Service & { vendor?: { businessName: string; slug: string } };
  favorite: boolean;
  onToggleFavorite: () => void;
}

export default function ServiceCard({ service, favorite, onToggleFavorite }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {/* الصورة */}
      {service.image && (
        <div className="h-48 bg-gray-200 relative">
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* الاسم والتقييم */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-fekrti-navy line-clamp-2">{service.title}</h3>
          <button
            onClick={onToggleFavorite}
            className="text-2xl"
            aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            aria-pressed={favorite}
          >
            {favorite ? '❤️' : '🤍'}
          </button>
        </div>

        {/* التاجر */}
        {service.vendor && <p className="text-sm text-gray-600 mb-3">بواسطة: {service.vendor.businessName}</p>}

        {/* التقييم */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-yellow-400">⭐</span>
          <span className="font-semibold">{service.rating.toFixed(1)}</span>
          <span className="text-gray-600 text-sm">({service.reviewCount})</span>
        </div>

        {/* المزايا */}
        <div className="mb-4 space-y-1">
          {service.features.slice(0, 2).map((feature, idx) => (
            <p key={idx} className="text-sm text-gray-600">✓ {feature}</p>
          ))}
        </div>

        {/* السعر والزر */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-2xl font-bold text-fekrti-primary">{formatCurrency(service.price, service.currency)}</p>
          </div>
          <Link
            href={`/marketplace/${service.vendor?.slug ?? '_'}/${service.slug}`}
            className="px-4 py-2 bg-fekrti-primary text-white rounded-lg hover:bg-fekrti-primary/90"
          >
            اطلب الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
