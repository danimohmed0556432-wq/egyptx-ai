'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Radio } from 'lucide-react';

export default function MasperoOverlay() {
  const { theme } = useTheme();
  const { locale } = useLanguage();

  if (theme !== 'maspero') return null;

  const badgeText =
    locale === 'ar' ? 'هنا القاهرة • ماسبيرو زمان' : 'HERE IS CAIRO • MASPERO 1960';

  return (
    <>
      {/* Subtle 1960s archival film grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
        }}
      />

      {/* Vintage broadcast corner pill */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed bottom-4 left-4 rtl:left-auto rtl:right-4 z-40 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E1B18]/90 border border-[#C29B61]/45 text-[#E8E0D0] shadow-[0_6px_24px_rgba(0,0,0,0.45)] backdrop-blur-md"
      >
        <Radio className="w-3.5 h-3.5 text-[#C29B61]" />
        <span className="text-[11px] font-semibold tracking-wider uppercase">
          {badgeText}
        </span>
      </div>
    </>
  );
}
