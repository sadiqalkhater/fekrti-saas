// app/(masar)/login/page.tsx

import type { Metadata } from 'next';
import AuthForm from '@/components/masar/AuthForm';

export const metadata: Metadata = { title: 'تسجيل الدخول | فكرتي' };

export default function LoginPage({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="login" next={searchParams.next} />;
}
