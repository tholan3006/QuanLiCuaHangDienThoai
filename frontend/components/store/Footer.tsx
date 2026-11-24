import { CreditCard, Phone, RefreshCw, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function StoreFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      {/* 4 khối cam kết chính sách Apple */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Chính Hãng Apple 100%</h4>
                <p className="text-xs text-slate-500 mt-0.5">Bảo hành 12 tháng tại Apple Care toàn quốc</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Giao Hàng Hỏa Tốc</h4>
                <p className="text-xs text-slate-500 mt-0.5">Miễn phí giao hàng toàn quốc khi đặt mua</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
                <RefreshCw className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">1 Đổi 1 Trong 30 Ngày</h4>
                <p className="text-xs text-slate-500 mt-0.5">Đổi mới ngay nếu phát sinh lỗi từ nhà sản xuất</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Thanh Toán Linh Hoạt</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hỗ trợ nhận hàng COD hoặc Chuyển khoản VietQR</p>
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
              <span className="font-black text-slate-900 text-xl tracking-tight">
                <span className="text-sky-600">i</span>Store
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Hệ thống phân phối các dòng điện thoại iPhone chính hãng. Đối chiếu dữ liệu tồn kho và giá bán tức thời qua hệ thống API NestJS & PostgreSQL.
            </p>
            <div className="text-xs text-slate-700 pt-1 flex items-center gap-2 font-semibold">
              <Phone className="h-3.5 w-3.5 text-sky-600" />
              <span>Hotline: 1800 6868 (Miễn phí 8:00 - 21:30)</span>
            </div>
          </div>

          {/* Cột 2: Dòng sản phẩm */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Các Dòng iPhone
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?madanhmuc=1" className="hover:text-sky-600 transition-colors">
                  iPhone 16 Series (Flagship 2026)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=2" className="hover:text-sky-600 transition-colors">
                  iPhone 15 Series (Khung Titan)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=3" className="hover:text-sky-600 transition-colors">
                  iPhone 14 Series (Đẳng cấp bền bị)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=4" className="hover:text-sky-600 transition-colors">
                  iPhone 13 Series (Quốc dân)
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Trải nghiệm mua sắm */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Quy Trình Mua Sắm
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-sky-600 transition-colors">
                  Tìm kiếm & Lọc tức thì
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-sky-600 transition-colors">
                  Giỏ hàng & Kiểm soát tồn kho
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-sky-600 transition-colors">
                  Đặt hàng & Đối chiếu giá API
                </Link>
              </li>
              <li>
                <Link href="/staff/products" className="hover:text-sky-600 transition-colors">
                  Cổng quản trị Nhân viên bán hàng
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: Thông tin đồ án */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Đồ Án Môn Học
            </h5>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 space-y-1.5 text-xs">
              <div className="font-bold text-slate-900">Phân Tích Thiết Kế HTTT</div>
              <div className="text-slate-500">Trường Đại học Sài Gòn (SGU)</div>
              <div className="text-slate-500 font-semibold">Mục III: A. MUA HÀNG (70 điểm)</div>
              <div className="text-sky-600 font-bold pt-1">
                TV3: Giao diện Khách hàng & Giỏ hàng
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © 2026 iStore. Đồ án học phần Phân Tích Thiết Kế Hệ Thống Thông Tin - Khoa CNTT, Trường ĐH Sài Gòn.
      </div>
    </footer>
  );
}
