// components/dashboard/Providers.tsx
'use client';

import { Toaster } from 'react-hot-toast';

/** إشعارات react-hot-toast لصفحات لوحة التحكم والسوق */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster position="top-center" toastOptions={{ style: { fontFamily: 'Cairo, system-ui, sans-serif' } }} />
    </>
  );
}
