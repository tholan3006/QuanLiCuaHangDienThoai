import Link from 'next/link';
import React from 'react';

export default function StoreBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-2xl border border-slate-800">
      {/* Hiệu ứng nền ánh kim loại */}
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Cột chữ giới thiệu */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <span></span>
              <span>Thế hệ Flagship mới nhất • iPhone 16 Pro Max</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Sức Mạnh Titan. <br />
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
                Màu Titan Sa Mạc.
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              Trang bị Chip <strong>A18 Pro</strong> tối tân, Nút Điều Khiển Camera (Camera Control), Zoom quang 5x trên cả hai bản Pro và thời lượng pin đột phá chưa từng có.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products/1"
                className="rounded-2xl bg-white px-6 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg hover:bg-slate-100 transition-all"
              >
                Khám Phá iPhone 16 Pro Max ➔
              </Link>
              <Link
                href="/products"
                className="rounded-2xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all"
              >
                Xem Toàn Bộ Dòng Máy
              </Link>
            </div>

            {/* Các điểm nổi bật ngắn */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <div className="font-extrabold text-amber-400 text-sm sm:text-base">A18 Pro</div>
                <div className="text-slate-400 text-[11px]">Chip 3nm thế hệ 2</div>
              </div>
              <div>
                <div className="font-extrabold text-blue-400 text-sm sm:text-base">48MP Fusion</div>
                <div className="text-slate-400 text-[11px]">Quay 4K 120fps</div>
              </div>
              <div>
                <div className="font-extrabold text-emerald-400 text-sm sm:text-base">33 Giờ</div>
                <div className="text-slate-400 text-[11px]">Thời lượng xem video</div>
              </div>
            </div>
          </div>

          {/* Cột ảnh minh họa */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-blue-600 opacity-30 blur group-hover:opacity-60 transition duration-500" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80"
                  alt="iPhone 16 Pro Max Titan Sa Mạc"
                  className="h-72 sm:h-80 w-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="p-3 text-center">
                  <div className="text-xs font-bold text-white">iPhone 16 Pro Max • Titan Sa Mạc</div>
                  <div className="text-[11px] text-amber-400 font-semibold">Chính hãng VN/A • Sẵn hàng giao ngay</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
