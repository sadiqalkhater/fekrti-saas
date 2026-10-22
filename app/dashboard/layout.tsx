// app/dashboard/layout.tsx
// لوحة التحكم تتطلب تسجيل الدخول

import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import DashboardNav from '@/components/dashboard/DashboardNav';
import Providers from '@/components/dashboard/Providers';

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const me = await getCurrentUser();
  if (!me) redirect('/login?next=/dashboard');
  return (
    <Providers>
      <div className="min-h-screen bg-gray-50">
        <DashboardNav userName={me.name} />
        <main className="max-w-7xl mx-auto">{children}</main>
      </div>
    </Providers>
  );
}
