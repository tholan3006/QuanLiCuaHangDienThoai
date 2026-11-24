'use client';

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from 'lucide-react';
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
          success: 'bg-slate-900 border-slate-700 text-white',
          error: 'bg-rose-950 border-rose-800 text-rose-100',
          warning: 'bg-amber-950 border-amber-800 text-amber-100',
          info: 'bg-slate-900 border-slate-700 text-white',
        };

        const renderIcon = () => {
          switch (t.type) {
            case 'success':
              return <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />;
            case 'error':
              return <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />;
            case 'warning':
              return <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />;
            case 'info':
            default:
              return <Info className="h-4 w-4 text-sky-400 shrink-0" />;
          }
        };

        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border p-4 shadow-2xl backdrop-blur animate-in slide-in-from-bottom-5 duration-200 ${bgColors[t.type]}`}
          >
            {renderIcon()}
            <div className="flex-1 text-xs font-semibold leading-relaxed">
              {t.message}
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-white/60 hover:text-white p-0.5 rounded shrink-0 ml-1"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
