// components/dashboard/DashboardNav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useVendor';

const LINKS = [
  { href: '/dashboard', label: 'لوحة التحكم' },
  { href: '/dashboard/invoices', label: 'الفواتير' },
  { href: '/dashboard/profile', label: 'المتجر' },
  { href: '/masar', label: 'مسار للمهام' },
  { href: '/marketplace', label: 'السوق' },
];

export default function DashboardNav({ userName }: { userName: string }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const active = (href: string) => (href === '/dashboard' ? pathname === href : pathname.startsWith(href));
  return (
    <header className="bg-fekrti-navy text-white">
      <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
        <Link href="/dashboard" className="text-2xl font-black">
          فكرتي
        </Link>
        <nav className="flex flex-wrap gap-1 flex-1">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${active(l.href) ? 'bg-white/15' : 'text-white/75 hover:text-white hover:bg-white/10'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <span className="text-sm text-white/75">{userName}</span>
        <button
          onClick={async () => {
            await logout();
            window.location.href = '/login';
          }}
          className="text-sm font-semibold text-white/75 hover:text-white"
        >
          خروج
        </button>
      </div>
    </header>
  );
}
