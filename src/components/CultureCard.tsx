'use client';

import React, { useState } from 'react';
import { ArrowUpRight, ArrowUpLeft } from 'lucide-react';
import type { CultureIconEntry, CultureLang, CultureUiStrings } from '@/data/egyptianCultureData';

interface CultureCardProps {
  item: CultureIconEntry;
  lang: CultureLang;
  ui: CultureUiStrings;
  onSelect: (item: CultureIconEntry) => void;
}

export default function CultureCard({ item, lang, ui, onSelect }: CultureCardProps) {
  const [hasError, setHasError] = useState(false);
  const localized = item.locales[lang] || item.locales.en;
  const showImage = Boolean(item.image && !hasError);
  const isRtl = lang === 'ar';

  const initials = localized.name
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const ArrowIcon = isRtl ? ArrowUpLeft : ArrowUpRight;

  return (
    <article
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={() => onSelect(item)}
      className="relative overflow-hidden rounded-2xl group border border-[#76501F]/60 hover:border-[#D6A044] transition-all duration-300 flex flex-col bg-[#F8F3E9] dark:bg-[#0D0A06] shadow-[0_10px_30px_rgba(8,7,5,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.55)] hover:shadow-[0_20px_48px_rgba(214,160,68,0.18)] cursor-pointer"
    >
      {/* Subtle museum corner filigree accents */}
      <span className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-[#D6A044]/50 z-20 transition-colors group-hover:border-[#D6A044]" />
      <span className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-[#D6A044]/50 z-20 transition-colors group-hover:border-[#D6A044]" />
      <span className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-[#D6A044]/40 z-20 transition-colors group-hover:border-[#D6A044]" />
      <span className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-[#D6A044]/40 z-20 transition-colors group-hover:border-[#D6A044]" />

      {/* Museum Portrait Frame */}
      <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-[#120E09] shrink-0">
        {showImage ? (
          <>
            <img
              src={item.image}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-35 pointer-events-none"
            />
            <img
              src={item.image}
              alt={localized.name}
              onError={() => setHasError(true)}
              className="relative z-10 w-full h-full object-contain object-top grayscale-[18%] sepia-[10%] group-hover:grayscale-0 group-hover:sepia-0 transition-all duration-500 ease-out group-hover:scale-[1.03]"
            />
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#080705] via-[#21170D] to-[#76501F]/40 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-[#080705]/80 border border-[#D6A044]/50 flex items-center justify-center shadow-lg">
              <span className="text-xl font-extrabold text-[#D6A044] select-none font-serif tracking-wider">
                {initials}
              </span>
            </div>
          </div>
        )}

        {/* Warm gold tint veil on hover + subtle bottom gradient for legibility */}
        <div className="absolute inset-0 z-10 bg-[#D6A044]/0 group-hover:bg-[#D6A044]/10 transition-colors duration-500 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-28 z-10 bg-gradient-to-t from-[#0c0a08] via-[#0c0a08]/55 to-transparent pointer-events-none" />

        {/* Top Badges: Epithet Pill & Era Medallion */}
        <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2 z-20">
          <span className="text-[11px] font-semibold text-[#F5DFA0] bg-[#080705]/80 backdrop-blur-md border border-[#D6A044]/45 px-3 py-1 rounded-full tracking-wide shadow-sm truncate max-w-[66%]">
            {localized.epithet}
          </span>
          <span
            dir="ltr"
            className="text-[10px] font-mono font-semibold text-[#F5EFE6] bg-[#080705]/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#D6A044]/35 shrink-0 shadow-sm"
          >
            {item.era}
          </span>
        </div>

        {/* Bottom Overlay: Icon Name in large serif/display typography */}
        <div className="absolute bottom-3.5 left-4 right-4 z-20 text-start">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#FBF7EE] drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-tight tracking-tight">
            {localized.name}
          </h3>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col justify-between flex-grow bg-[#F8F3E9] dark:bg-[#0D0A06] text-start">
        <p className="text-sm text-[#1A2332]/90 dark:text-[#E8DFCE]/90 leading-relaxed font-medium line-clamp-2 mb-5">
          {localized.summary}
        </p>

        {/* Tactile Gold-Accented Footer Action */}
        <div className="pt-3.5 border-t border-[#76501F]/25 dark:border-[#76501F]/40 flex items-center justify-between mt-auto">
          <span className="text-[11px] text-[#76501F] dark:text-[#D6A044]/80 font-semibold tracking-wider uppercase">
            {ui.heritageTag}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(item);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#21170D]/5 dark:bg-[#21170D] hover:bg-[#D6A044] text-[#76501F] dark:text-[#F5DFA0] hover:text-[#080705] dark:hover:text-[#080705] text-xs font-bold border border-[#76501F]/40 hover:border-[#D6A044] transition-all duration-200 cursor-pointer shadow-sm"
          >
            <span>{ui.learnMore}</span>
            <ArrowIcon className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
