import type { Metadata } from 'next';
import React from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hệ Thống Quản Lý Cửa Hàng Điện Thoại iPhone',
  description: 'Quản lý danh mục, sản phẩm iPhone, tồn kho, đơn hàng và hóa đơn',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
