'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useVendor } from '@/hooks/useVendor';
import StatCard from '../components/StatCard';
import RecentInvoices from '../components/RecentInvoices';
import TopServices from '../components/TopServices';

export default function DashboardPage() {
  const { vendor, stats, loading } = useVendor();
  const [chartData, setChartData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    if (stats) {
      // بيانات إيرادات شهرية تجريبية
      setRevenueData([
        { month: 'يناير', revenue: 45000 },
        { month: 'فبراير', revenue: 52000 },
        { month: 'مارس', revenue: 48000 },
        { month: 'أبريل', revenue: 61000 },
        { month: 'مايو', revenue: 55000 },
        { month: 'يونيو', revenue: 67000 },
      ]);

      setChartData([
        { name: 'الفواتير', value: stats.totalInvoices },
        { name: 'العروض', value: stats.totalProposals },
        { name: 'المشاريع', value: stats.totalProjects },
        { name: 'الخدمات', value: stats.totalServices },
      ]);
    }
  }, [stats]);

  if (loading) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* الرأس */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-fekrti-navy">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">أهلاً بعودتك، {vendor?.businessName}</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="إجمالي الإيرادات"
          value={`${(stats?.totalRevenue || 0).toLocaleString('ar-SA')} ر.س`}
          icon="💰"
          trend="+12.5%"
        />
        <StatCard
          title="الفواتير"
          value={stats?.totalInvoices || 0}
          icon="📄"
          trend={`${stats?.totalInvoices || 0} فاتورة`}
        />
        <StatCard
          title="العروض"
          value={stats?.totalProposals || 0}
          icon="🎁"
          trend={`${stats?.totalProposals || 0} عرض`}
        />
        <StatCard
          title="المشاريع"
          value={stats?.totalProjects || 0}
          icon="📊"
          trend={`${stats?.totalProjects || 0} مشروع`}
        />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* الإيرادات الشهرية */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-fekrti-navy mb-4">الإيرادات الشهرية</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#1B6CA8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع الفواتير والعروض */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-fekrti-navy mb-4">توزيع البيانات</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#1B6CA8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* الفواتير والخدمات الأخيرة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInvoices vendorId={vendor?.id || ''} />
        <TopServices vendorId={vendor?.id || ''} />
      </div>
    </div>
  );
}
