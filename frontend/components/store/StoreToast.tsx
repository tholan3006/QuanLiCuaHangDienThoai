'use client';

import React from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface StoreToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function StoreToast({ toasts, onDismiss }: StoreToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const bgColors = {
          success: 'bg-emerald-900/95 border-emerald-500 text-white',
          error: 'bg-red-900/95 border-red-500 text-white',
          warning: 'bg-amber-900/95 border-amber-500 text-white',
          info: 'bg-blue-900/95 border-blue-500 text-white',
        };

        const icons = {
          success: '✅',
          error: '❌',
          warning: '⚠️',
          info: 'ℹ️',
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur animate-in slide-in-from-bottom-5 duration-200 ${bgColors[t.type]}`}
          >
            <span className="text-lg">{icons[t.type]}</span>
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {t.message}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-white/60 hover:text-white text-xs font-bold shrink-0 ml-1"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
