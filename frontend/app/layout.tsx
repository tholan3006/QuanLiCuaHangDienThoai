import type { Metadata } from 'next';
import React from 'react';
import { LanguageProvider } from '../contexts/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'iStore - Hệ Thống Phân Phối iPhone Chính Hãng Apple VN/A',
  description: 'Chuyên cung cấp iPhone 16 Pro Max, iPhone 15 Series chính hãng Apple Care 12 tháng.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased min-h-screen transition-colors duration-200">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
