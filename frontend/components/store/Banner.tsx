import { ArrowRight, BatteryCharging, Camera, Cpu, Sparkles } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function StoreBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-2xl border border-slate-800">
      {/* Hiệu ứng nền ánh kim loại Titan */}
      <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Cột chữ giới thiệu */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Flagship Mới Nhất • iPhone 16 Pro Max</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Sức Mạnh Titan. <br />
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
                Titan Sa Mạc Đột Phá.
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              Trang bị Chip <strong>Apple A18 Pro</strong> tối tân, Nút Điều Khiển Camera (Camera Control), Zoom quang 5x và thời lượng pin vượt trội.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products/1"
                className="rounded-xl bg-white px-6 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2"
              >
                <span>Khám Phá iPhone 16 Pro Max</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 transition-all"
              >
                Xem Toàn Bộ Dòng Máy
              </Link>
            </div>

            {/* Các điểm nổi bật */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-400 text-sm sm:text-base">
                  <Cpu className="h-4 w-4" />
                  <span>A18 Pro</span>
                </div>
                <div className="text-slate-400 text-[11px]">Chip 3nm thế hệ mới</div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-extrabold text-sky-400 text-sm sm:text-base">
                  <Camera className="h-4 w-4" />
                  <span>48MP Fusion</span>
                </div>
                <div className="text-slate-400 text-[11px]">Quay 4K 120fps</div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-400 text-sm sm:text-base">
                  <BatteryCharging className="h-4 w-4" />
                  <span>33 Giờ</span>
                </div>
                <div className="text-slate-400 text-[11px]">Xem video liên tục</div>
              </div>
            </div>
          </div>

          {/* Cột ảnh minh họa với ảnh cục bộ */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group max-w-sm w-full">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 to-sky-600 opacity-20 blur group-hover:opacity-40 transition duration-500" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-4 shadow-2xl flex flex-col items-center">
                <img
                  src="/images/banners/hero-desert-titanium.jpg"
                  alt="iPhone 16 Pro Max Titan Sa Mạc"
                  className="h-72 sm:h-80 w-auto object-contain group-hover:scale-105 transition-transform duration-500"
                />
                <div className="pt-3 text-center">
                  <div className="text-xs font-bold text-white">iPhone 16 Pro Max • Titan Sa Mạc</div>
                  <div className="text-[11px] text-amber-400 font-semibold mt-0.5">Sẵn hàng giao ngay tại hệ thống iStore</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
