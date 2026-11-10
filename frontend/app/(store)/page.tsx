import Link from 'next/link';
import React from 'react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col justify-between">
      <header className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-xl font-bold">
              
            </span>
            <div>
              <div className="font-extrabold tracking-tight text-base">
                iPhone Store Vietnam
              </div>
              <div className="text-xs text-slate-400">
                Hệ thống Quản lý và Bán Điện thoại iPhone Chính hãng
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="rounded-xl border border-slate-600 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800"
            >
              🛍️ Trang Khách Hàng (/products)
            </Link>
            <Link
              href="/staff/products"
              className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-blue-500"
            >
              👨‍💼 Quản lý Sản phẩm - Nhân viên (/staff/products)
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-16 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-300">
          Thành viên 2 • Quản trị Cơ sở dữ liệu & Quản lý Danh mục, Sản phẩm iPhone
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          Hệ Thống Quản Lý Cửa Hàng <br />
          <span className="text-blue-400">Điện Thoại iPhone</span>
        </h1>

        <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed">
          Cơ sở dữ liệu PostgreSQL & Prisma ORM thiết kế theo sơ đồ quan hệ 13 bảng
          (`DANH_MUC`, `SAN_PHAM`, `TON_KHO`, `DON_HANG`, `CHI_TIET_DON_HANG`, `HOA_DON`...).
          Hỗ trợ quản lý phiên bản theo Màu sắc, Dung lượng, Mã SKU và bảo toàn dữ liệu bằng Soft Delete.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/staff/products"
            className="rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500"
          >
            Vào Giao Diện Nhân Viên Quản Lý Sản Phẩm →
          </Link>
          <Link
            href="/products"
            className="rounded-2xl border border-slate-600 bg-slate-800/80 px-7 py-3.5 text-sm font-bold text-white hover:bg-slate-700"
          >
            Xem Trang Khách Hàng Mua Sắm (Đã ẩn SP ngừng bán)
          </Link>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-5 text-center text-xs text-slate-400">
        Dự án Quản Lý Cửa Hàng Điện Thoại iPhone • PostgreSQL + Prisma + NestJS + Next.js
      </footer>
    </div>
  );
}
