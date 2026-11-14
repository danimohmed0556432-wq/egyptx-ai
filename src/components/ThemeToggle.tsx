'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Sun, Moon, Tv } from 'lucide-react';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const { locale } = useLanguage();

  const isAr = locale === 'ar';
  const masperoLabel = isAr ? 'ماسبيرو زمان' : 'Maspero Zaman';
  const darkLabel = isAr ? 'الوضع الداكن الفرعوني' : 'Pharaonic Dark';
  const lightLabel = isAr ? 'وضع البردي المضيء' : 'Papyrus Light';

  const containerClass =
    theme === 'light'
      ? 'bg-[#EFE8D8] border-[#76501F]/25'
      : theme === 'maspero'
      ? 'bg-[#1E1B18] border-[#C29B61]/40'
      : 'bg-[#12100C]/90 border-[#D6A044]/30';

  const getBtnClass = (active: boolean) => {
    if (!active) {
      return theme === 'light'
        ? 'text-[#6A5A45] hover:text-[#1A1510] hover:bg-white/60'
        : 'text-[#C7B9A5]/75 hover:text-[#F5EFE6] hover:bg-white/5';
    }
    if (theme === 'maspero') {
      return 'bg-[#C29B61]/20 text-[#C29B61] border border-[#C29B61]/50 shadow-sm';
    }
    if (theme === 'light') {
      return 'bg-white text-[#9A6B21] border border-[#9A6B21]/30 shadow-sm';
    }
    return 'bg-[#D6A044]/20 text-[#FFD27A] border border-[#D6A044]/40 shadow-sm';
  };

  return (
    <div
      role="group"
      aria-label={isAr ? 'تبديل المظهر' : 'Theme selector'}
      className={`inline-flex items-center gap-0.5 p-1 rounded-full border transition-colors duration-300 ${containerClass} ${className}`}
    >
      <button
        type="button"
        onClick={() => setTheme('dark')}
        title={darkLabel}
        aria-label={darkLabel}
        aria-pressed={theme === 'dark'}
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer ${getBtnClass(
          theme === 'dark'
        )}`}
      >
        <Moon className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('light')}
        title={lightLabel}
        aria-label={lightLabel}
        aria-pressed={theme === 'light'}
        className={`flex items-center justify-center w-7 h-7 rounded-full transition-all duration-200 cursor-pointer ${getBtnClass(
          theme === 'light'
        )}`}
      >
        <Sun className="w-3.5 h-3.5" />
      </button>

      <button
        type="button"
        onClick={() => setTheme('maspero')}
        title={masperoLabel}
        aria-label={masperoLabel}
        aria-pressed={theme === 'maspero'}
        className={`flex items-center gap-1.5 h-7 rounded-full transition-all duration-200 cursor-pointer ${
          theme === 'maspero' ? 'px-2.5' : 'w-7 justify-center'
        } ${getBtnClass(theme === 'maspero')}`}
      >
        <Tv className="w-3.5 h-3.5 shrink-0" />
        {theme === 'maspero' && (
          <span className="hidden xl:inline text-[11px] font-semibold tracking-wide whitespace-nowrap">
            {masperoLabel}
          </span>
        )}
      </button>
    </div>
  );
}
