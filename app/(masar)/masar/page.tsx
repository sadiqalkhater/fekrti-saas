// app/(masar)/masar/page.tsx
// مسار: إدارة المهام لفرق فكرتي

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import MasarApp from '@/components/masar/MasarApp';

export const metadata: Metadata = { title: 'مسار | فكرتي' };
export const dynamic = 'force-dynamic';

export default async function MasarPage() {
  const me = await getCurrentUser();
  if (!me) redirect('/login?next=/masar');
  return <MasarApp />;
}
