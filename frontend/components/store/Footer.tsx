import Link from 'next/link';
import React from 'react';

export default function StoreFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      {/* 4 khối cam kết chính sách Apple */}
      <div className="border-b border-slate-100 bg-slate-50/60 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 text-2xl font-bold">
                🛡️
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Chính Hãng Apple 100%</h4>
                <p className="text-xs text-slate-500 mt-0.5">Bảo hành 12 tháng tại Apple Care toàn quốc</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 text-2xl font-bold">
                🚚
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Giao Hàng Hỏa Tốc</h4>
                <p className="text-xs text-slate-500 mt-0.5">Miễn phí giao hàng toàn quốc khi đặt mua</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 text-2xl font-bold">
                🔄
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">1 Đổi 1 Trong 30 Ngày</h4>
                <p className="text-xs text-slate-500 mt-0.5">Đổi mới ngay nếu phát sinh lỗi từ nhà sản xuất</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 text-2xl font-bold">
                💳
              </span>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Thanh Toán Linh Hoạt</h4>
                <p className="text-xs text-slate-500 mt-0.5">Hỗ trợ thanh toán COD hoặc Chuyển khoản QR</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Cột 1: Thông tin hệ thống */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold text-lg">
                
              </span>
              <span className="font-extrabold text-slate-900 text-base">iPhone Store VN</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Hệ thống bán lẻ các sản phẩm Apple iPhone chính hãng tại Việt Nam. Nền tảng thương mại điện tử hiện đại, đối chiếu tồn kho và giá bán tức thời.
            </p>
            <div className="text-xs text-slate-600 pt-1">
              <strong>Hotline:</strong> 1800 6868 (Miễn phí 8:00 - 21:30)
            </div>
          </div>

          {/* Cột 2: Dòng sản phẩm */}
          <div>
            <h5 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Các Dòng iPhone
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/products?madanhmuc=1" className="hover:text-blue-600 transition-colors">
                  iPhone 16 Series (Flagship 2026)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=2" className="hover:text-blue-600 transition-colors">
                  iPhone 15 Series (Khung Titan)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=3" className="hover:text-blue-600 transition-colors">
                  iPhone 14 Series (Đẳng cấp bền bỉ)
                </Link>
              </li>
              <li>
                <Link href="/products?madanhmuc=4" className="hover:text-blue-600 transition-colors">
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
                <Link href="/products" className="hover:text-blue-600 transition-colors">
                  Tìm kiếm & Lọc sản phẩm
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-blue-600 transition-colors">
                  Giỏ hàng & Kiểm tra tồn kho
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-blue-600 transition-colors">
                  Đặt hàng & Đối chiếu giá API
                </Link>
              </li>
              <li>
                <Link href="/staff/products" className="hover:text-blue-600 transition-colors">
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
              <div className="text-slate-500">Đề tài: Quản lý & Bán iPhone</div>
              <div className="text-blue-600 font-semibold pt-1">
                Thành viên 3: Storefront & Giỏ hàng
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        © 2026 iPhone Store VN. Đồ án môn Phân Tích Thiết Kế Hệ Thống Thông Tin - Khoa CNTT, ĐH Sài Gòn.
      </div>
    </footer>
  );
}
