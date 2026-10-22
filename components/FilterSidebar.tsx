
// components/FilterSidebar.tsx
'use client';

import { formatCurrency } from '@/utils/helpers';

interface FilterSidebarProps {
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export default function FilterSidebar({
  priceRange,
  onPriceChange,
  sortBy,
  onSortChange,
}: FilterSidebarProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow h-fit">
      {/* التصفية حسب السعر */}
      <div className="mb-6">
        <h3 className="font-bold text-fekrti-navy mb-4">نطاق السعر</h3>
        <input
          type="range"
          min="0"
          max="50000"
          value={priceRange[1]}
          onChange={(e) => onPriceChange([priceRange[0], parseInt(e.target.value)])}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-sm">
          <span>{formatCurrency(priceRange[0], 'SAR')}</span>
          <span>{formatCurrency(priceRange[1], 'SAR')}</span>
        </div>
      </div>

      {/* التصفية حسب الترتيب */}
      <div>
        <h3 className="font-bold text-fekrti-navy mb-4">الترتيب</h3>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full p-2 border rounded-lg"
        >
          <option value="newest">الأحدث</option>
          <option value="popular">الأكثر شهرة</option>
          <option value="rating">التقييم</option>
          <option value="price_asc">السعر: الأقل أولاً</option>
          <option value="price_desc">السعر: الأعلى أولاً</option>
        </select>
      </div>
    </div>
  );
}
