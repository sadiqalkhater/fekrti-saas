// app/marketplace/[vendorSlug]/[serviceSlug]/page.tsx
// صفحة خدمة في السوق

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { formatCurrency, formatDate } from '@/utils/helpers';
import { SERVICE_CATEGORIES } from '@/utils/constants';

export const dynamic = 'force-dynamic';

export default async function ServicePage({ params }: { params: { vendorSlug: string; serviceSlug: string } }) {
  const service = await prisma.service.findFirst({
    where: {
      slug: decodeURIComponent(params.serviceSlug),
      status: 'ACTIVE',
      vendor: { slug: decodeURIComponent(params.vendorSlug), status: 'APPROVED', suspended: false },
    },
    include: {
      vendor: { select: { businessName: true, phone: true, email: true, website: true, city: true, rating: true } },
      reviews: { take: 10, orderBy: { createdAt: 'desc' }, include: { user: { select: { name: true } } } },
    },
  });
  if (!service) notFound();
  const category = SERVICE_CATEGORIES.find((c) => c.id === service.category);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-fekrti-navy to-fekrti-primary py-10">
        <div className="max-w-5xl mx-auto px-4">
          <Link href="/marketplace" className="text-blue-100 text-sm hover:underline">
            → سوق الخدمات
          </Link>
          <h1 className="text-3xl font-bold text-white mt-2">{service.title}</h1>
          <p className="text-blue-100 mt-1">
            {service.vendor.businessName}
            {category ? ` · ${category.name}` : ''}
          </p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-fekrti-navy mb-3">عن الخدمة</h2>
            <p className="whitespace-pre-wrap text-gray-700 leading-7">{service.description}</p>
            {service.features.length > 0 && (
              <ul className="mt-4 space-y-1">
                {service.features.map((f) => (
                  <li key={f} className="text-gray-700">
                    ✓ {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-fekrti-navy mb-3">
              التقييمات <span className="text-gray-500 text-base">({service.reviewCount})</span>
            </h2>
            {service.reviews.length === 0 ? (
              <p className="text-gray-500">لا توجد تقييمات بعد.</p>
            ) : (
              <ul className="divide-y">
                {service.reviews.map((r) => (
                  <li key={r.id} className="py-3">
                    <p className="font-semibold">
                      {r.user.name} <span className="text-yellow-500">{'★'.repeat(Math.round(r.rating))}</span>
                    </p>
                    {r.comment && <p className="text-gray-700 mt-1">{r.comment}</p>}
                    <p className="text-xs text-gray-500 mt-1">{formatDate(r.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <aside className="bg-white rounded-lg shadow p-6 h-fit space-y-3">
          <p className="text-3xl font-bold text-fekrti-primary">{formatCurrency(service.price, service.currency)}</p>
          {service.duration && <p className="text-gray-600">مدة التنفيذ: {service.duration}</p>}
          {service.revisions != null && <p className="text-gray-600">عدد التعديلات: {service.revisions}</p>}
          <p className="text-gray-600">
            ⭐ {service.rating.toFixed(1)} · {service.orderCount} طلب
          </p>
          <div className="border-t pt-3 space-y-1">
            <p className="font-bold text-fekrti-navy">تواصل مع {service.vendor.businessName}</p>
            {service.vendor.phone && (
              <p dir="ltr" className="text-right">
                {service.vendor.phone}
              </p>
            )}
            {service.vendor.email && (
              <p dir="ltr" className="text-right">
                {service.vendor.email}
              </p>
            )}
            {service.vendor.city && <p className="text-gray-600">{service.vendor.city}</p>}
            {!service.vendor.phone && !service.vendor.email && <p className="text-gray-500 text-sm">لم يضف التاجر وسيلة تواصل بعد.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
