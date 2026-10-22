'use client';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useVendor } from '@/hooks/useVendor';
import StatCard from '@/components/ui/StatCard';
import RecentInvoices from '@/components/dashboard/RecentInvoices';
import TopServices from '@/components/dashboard/TopServices';
import CreateVendor from '@/components/dashboard/CreateVendor';
import { formatCurrency } from '@/utils/helpers';

export default function DashboardPage() {
  const { vendor, stats, topServices, loading, hasVendor, createVendor } = useVendor();

  if (loading) {
    return <div className="p-8 text-center">جاري التحميل...</div>;
  }
  if (!hasVendor) return <CreateVendor onCreate={createVendor} />;

  const chartData = [
    { name: 'الفواتير', value: stats?.totalInvoices ?? 0 },
    { name: 'العروض', value: stats?.totalProposals ?? 0 },
    { name: 'المشاريع', value: stats?.totalProjects ?? 0 },
    { name: 'الخدمات', value: stats?.totalServices ?? 0 },
  ];

  return (
    <div className="p-8">
      {/* الرأس */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-fekrti-navy">لوحة التحكم</h1>
        <p className="text-gray-600 mt-2">أهلاً بعودتك، {vendor?.businessName}</p>
      </div>

      {/* الإحصائيات الرئيسية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="الإيرادات المحصّلة" value={formatCurrency(stats?.totalRevenue ?? 0)} icon="💰" />
        <StatCard title="الفواتير" value={stats?.totalInvoices ?? 0} icon="📄" />
        <StatCard title="العروض" value={stats?.totalProposals ?? 0} icon="🎁" />
        <StatCard title="المشاريع" value={stats?.totalProjects ?? 0} icon="📊" />
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* الإيرادات الشهرية من دفعات الفواتير */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-fekrti-navy mb-1">الإيرادات الشهرية</h2>
          <p className="text-sm text-gray-500 mb-4">المبالغ المحصّلة من الفواتير في آخر 6 أشهر (ر.س)</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats?.monthlyRevenue ?? []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" reversed />
              <YAxis orientation="right" />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Line type="monotone" dataKey="revenue" name="الإيرادات" stroke="#1B6CA8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع الفواتير والعروض */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold text-fekrti-navy mb-4">توزيع البيانات</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" reversed />
              <YAxis orientation="right" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" name="العدد" fill="#1B6CA8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* الفواتير والخدمات الأخيرة */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentInvoices />
        <TopServices services={topServices} />
      </div>
    </div>
  );
}
