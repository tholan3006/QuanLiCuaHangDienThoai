'use client';

import {
  ArrowRight,
  BatteryCharging,
  Camera,
  Cpu,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StoreBanner() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0a1128] via-[#0f172a] to-[#0a1128] text-white shadow-2xl border border-slate-800/80">
      {/* Hào quang Titan Sa Mạc sang trọng */}
      <div className="absolute -right-16 -top-16 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-6 py-10 sm:py-14 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Cột trái: Giới thiệu sản phẩm */}
          <div className="lg:col-span-7 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>{t('flagship_badge')}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {t('hero_title_1')} <br />
              <span className="bg-gradient-to-r from-amber-200 via-orange-300 to-amber-100 bg-clip-text text-transparent">
                {t('hero_title_2')}
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-slate-300 leading-relaxed">
              {t('hero_desc')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/products/1"
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                className="rounded-xl bg-white px-6 py-3.5 text-xs sm:text-sm font-extrabold text-slate-950 shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2 group"
              >
                <span>{t('explore_16')}</span>
                <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/products"
                onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-6 py-3.5 text-xs sm:text-sm font-bold text-white hover:bg-slate-800 hover:border-slate-500 transition-all"
              >
                {t('view_all_models')}
              </Link>
            </div>

            {/* Các điểm nổi bật */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-extrabold text-amber-400 text-sm sm:text-base">
                  <Cpu className="h-4 w-4" />
                  <span>A18 Pro</span>
                </div>
                <div className="text-slate-400 text-[11px]">{t('spec_chip')}</div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-extrabold text-sky-400 text-sm sm:text-base">
                  <Camera className="h-4 w-4" />
                  <span>48MP Fusion</span>
                </div>
                <div className="text-slate-400 text-[11px]">{t('spec_cam')}</div>
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-extrabold text-emerald-400 text-sm sm:text-base">
                  <BatteryCharging className="h-4 w-4" />
                  <span>33 Giờ</span>
                </div>
                <div className="text-slate-400 text-[11px]">{t('spec_battery')}</div>
              </div>
            </div>
          </div>

          {/* Cột phải: Showcase máy đồng bộ 100% màu xanh nền (TUYỆT ĐỐI KHÔNG NỀN TRẮNG) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group max-w-sm w-full flex flex-col items-center">
              {/* Quầng sáng vàng ánh kim Titan Sa Mạc */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-orange-400/10 to-transparent blur-3xl transform group-hover:scale-105 transition duration-700 pointer-events-none" />

              {/* Khung trưng bày máy màu xanh Slate đồng điệu với nền (ĐÃ XÓA ĐƯỜNG VIỀN BORDER THEO HÌNH 3) */}
              <div className="relative z-10 w-full rounded-3xl p-2 sm:p-4 flex flex-col items-center">
                <Link
                  href="/products/1"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                  className="block relative w-full flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500"
                >
                  <img
                    src="/images/products/iphone-16-pro-max-desert.png"
                    alt="iPhone 16 Pro Max Titan Sa Mạc"
                    className="h-64 sm:h-72 w-auto object-contain filter drop-shadow-[0_16px_28px_rgba(197,169,136,0.35)]"
                  />
                </Link>

                {/* Badge thông tin dưới ảnh máy (không viền thô) */}
                <div className="mt-2 w-full max-w-xs rounded-2xl bg-slate-900/80 backdrop-blur px-4 py-2 text-center shadow-md">
                  <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-amber-400" />
                    <span>iPhone 16 Pro Max • Titan Sa Mạc</span>
                  </div>
                  <div className="text-[11px] text-amber-400/90 font-medium mt-0.5">
                    {t('in_stock_banner')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
