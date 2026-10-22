// app/(masar)/register/page.tsx

import type { Metadata } from 'next';
import AuthForm from '@/components/masar/AuthForm';

export const metadata: Metadata = { title: 'إنشاء حساب | فكرتي' };

export default function RegisterPage({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="register" next={searchParams.next} />;
}
