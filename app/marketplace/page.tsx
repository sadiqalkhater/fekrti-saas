'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { SERVICE_CATEGORIES } from '@/utils/constants';
import ServiceCard from '@/components/ServiceCard';
import SearchBar from '@/components/SearchBar';
import FilterSidebar from '@/components/FilterSidebar';

export default function MarketplacePage() {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 50000]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // جلب الخدمات
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/services', {
          params: {
            category: selectedCategory,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            search: searchQuery,
            sort: sortBy,
          },
        });
        setServices(response.data);
      } catch (error) {
        console.error('Error fetching services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [selectedCategory, priceRange, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* الرأس */}
      <div className="bg-gradient-to-r from-fekrti-navy to-fekrti-primary py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold text-white mb-4">سوق الخدمات</h1>
          <p className="text-blue-100 text-lg">اكتشف أفضل الخدمات من متخصصين موثوقين</p>
        </div>
      </div>

      {/* شريط البحث */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-lg">
          <SearchBar onSearch={setSearchQuery} />
        </div>
      </div>

      {/* الفئات السريعة */}
      <div className="max-w-7xl mx-auto px-4 mb-8">
        <h2 className="text-2xl font-bold mb-4">الفئات</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {SERVICE_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-4 rounded-lg text-center transition-all ${
                selectedCategory === category.id
                  ? 'bg-fekrti-primary text-white'
                  : 'bg-white text-fekrti-navy hover:bg-gray-100'
              }`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <p className="text-sm font-medium">{category.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* المحتوى الرئيسي */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* التصفية الجانبية */}
          <FilterSidebar
            priceRange={priceRange}
            onPriceChange={setPriceRange}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* الخدمات */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <p>جاري تحميل الخدمات...</p>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">لم يتم العثور على خدمات</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
