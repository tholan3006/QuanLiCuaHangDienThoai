'use client';

import { CreditCard, Phone, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StoreFooter() {
  const { lang } = useLanguage();

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 transition-colors">
      {/* 4 khối cam kết chính sách Apple */}
      <div className="border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {lang === 'VI' ? 'Chính Hãng Apple 100%' : '100% Genuine Apple'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'VI' ? 'Bảo hành 12 tháng tại Apple Care toàn quốc' : '12-Month Apple Care nationwide warranty'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {lang === 'VI' ? 'Giao Hàng Hỏa Tốc' : 'Express Delivery'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'VI' ? 'Miễn phí giao hàng toàn quốc khi đặt mua' : 'Free nationwide shipping on orders'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {lang === 'VI' ? '1 Đổi 1 Trong 30 Ngày' : '30-Day 1-to-1 Replacement'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'VI' ? 'Đổi mới ngay nếu phát sinh lỗi từ nhà sản xuất' : 'Instant swap for factory defects'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {lang === 'VI' ? 'Thanh Toán Linh Hoạt' : 'Flexible Payment'}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {lang === 'VI' ? 'Hỗ trợ COD hoặc Chuyển khoản VietQR' : 'Supports COD & VietQR transfers'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1: Thông tin hệ thống iStore */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 dark:text-white text-xl tracking-tight">
                <span className="text-sky-500">i</span>Store
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {lang === 'VI'
                ? 'Hệ thống phân phối các dòng điện thoại iPhone chính hãng. Đối chiếu dữ liệu tồn kho và giá bán tức thời qua hệ thống API NestJS & PostgreSQL.'
                : 'Authorized reseller of genuine Apple iPhone. Real-time inventory and price synchronization with NestJS & PostgreSQL backend.'}
            </p>
            <div className="text-xs text-slate-700 dark:text-slate-300 pt-1 flex items-center gap-2 font-semibold">
              <Phone className="h-3.5 w-3.5 text-sky-500" />
              <span>Hotline: 1800 6868 ({lang === 'VI' ? 'Miễn phí 8:00 - 21:30' : 'Toll-free 8:00 - 21:30'})</span>
            </div>
          </div>

          {/* Cột 2: Dòng sản phẩm */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              {lang === 'VI' ? 'Các Dòng iPhone' : 'iPhone Generations'}
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?madanhmuc=1" className="hover:text-sky-500 transition-colors">
                  iPhone 16 Series (Flagship 2026)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=2" className="hover:text-sky-500 transition-colors">
                  iPhone 15 Series (Khung Titan)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=3" className="hover:text-sky-500 transition-colors">
                  iPhone 14 Series (Bền bỉ, mạnh mẽ)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=4" className="hover:text-sky-500 transition-colors">
                  iPhone 13 Series (Lựa chọn quốc dân)
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Trải nghiệm mua sắm & Cổng nội bộ */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              {lang === 'VI' ? 'Quy Trình & Cổng Nội Bộ' : 'Services & Portals'}
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-sky-500 transition-colors">
                  {lang === 'VI' ? 'Danh sách & Lọc sản phẩm' : 'Products & Smart Filter'}
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-sky-500 transition-colors">
                  {lang === 'VI' ? 'Giỏ hàng & Kiểm soát tồn kho' : 'Shopping Cart & Stock Control'}
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-sky-500 transition-colors">
                  {lang === 'VI' ? 'Đặt hàng & Thanh toán' : 'Order & Payment'}
                </Link>
              </li>
              <li className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href="/staff/products"
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  🔒 {lang === 'VI' ? 'Cổng Nhân Viên Bán Hàng (Staff)' : 'Staff Portal'}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className="font-bold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  🛡️ {lang === 'VI' ? 'Cổng Quản Trị Server (Admin)' : 'Admin Server Portal'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Chính sách & Chăm sóc khách hàng (XÓA BỎ MỤC III & TV3) */}
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
              {lang === 'VI' ? 'Chính Sách & Hỗ Trợ' : 'Customer Support'}
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === 'VI' ? '• Trung tâm Apple Care ủy quyền' : '• Apple Authorized Service'}
                </span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === 'VI' ? '• Chính sách bảo mật thông tin' : '• Privacy & Security Policy'}
                </span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === 'VI' ? '• Quy định kiểm hàng & đổi trả' : '• Return & Inspection Policy'}
                </span>
              </li>
              <li>
                <span className="text-slate-500 dark:text-slate-400">
                  {lang === 'VI' ? '• Giao nhận & kiểm tra tận nơi' : '• Nationwide Express Courier'}
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400">
        © 2026 iStore. {lang === 'VI' ? 'Hệ thống phân phối iPhone chính hãng tại Việt Nam.' : 'Authorized iPhone Reseller in Vietnam.'}
      </div>
    </footer>
  );
}
