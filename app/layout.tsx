// app/layout.tsx
// التخطيط الجذري: العربية من اليمين لليسار وخط Cairo

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'فكرتي',
  description: 'منصة فكرتي لإدارة الأعمال',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&display=swap"
        />
      </head>
      <body className="font-cairo" style={{ fontFamily: 'Cairo, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
