// app/page.tsx
// الصفحة الرئيسية: لوحة التحكم لمن سجّل الدخول، والسوق للزوار

import { redirect } from 'next/navigation';
import { getSessionUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function Home() {
  redirect((await getSessionUserId()) ? '/dashboard' : '/marketplace');
}
