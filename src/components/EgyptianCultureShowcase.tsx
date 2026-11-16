'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Music,
  Film,
  Palette,
  BookOpen,
  Trophy,
  Landmark,
  Crown,
  Moon,
  Sparkles,
  ExternalLink,
  X,
  Quote,
  Award,
  Clock,
  Compass,
  type LucideIcon,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import CultureCard from '@/components/CultureCard';
import {
  CULTURE_ICONS,
  CULTURE_SECTIONS_META,
  CULTURE_UI,
  SPOTLIGHT_BY_SECTION,
  resolveCultureLang,
  type CultureIconEntry,
} from '@/data/egyptianCultureData';

const SECTION_ICONS: Record<string, LucideIcon> = {
  music: Music,
  cinema: Film,
  art: Palette,
  literature: BookOpen,
  sports: Trophy,
  history: Landmark,
  royals: Crown,
  heritage: Moon,
};

export default function EgyptianCultureShowcase() {
  const { locale } = useLanguage();
  const lang = resolveCultureLang(locale);
  const ui = CULTURE_UI[lang];
  const isRtl = lang === 'ar';

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedIcon, setSelectedIcon] = useState<CultureIconEntry | null>(null);
  const [spotlightImgError, setSpotlightImgError] = useState(false);
  const [modalImgError, setModalImgError] = useState(false);

  const spotlightItem = useMemo(() => {
    const targetId = SPOTLIGHT_BY_SECTION[activeCategory] || 'umm-kulthum';
    return CULTURE_ICONS.find((icon) => icon.id === targetId) || CULTURE_ICONS[0];
  }, [activeCategory]);

  useEffect(() => {
    setSpotlightImgError(false);
  }, [spotlightItem.id]);

  useEffect(() => {
    setModalImgError(false);
  }, [selectedIcon?.id]);

  useEffect(() => {
    if (!selectedIcon) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIcon(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIcon]);

  const visibleSections = useMemo(() => {
    const sections =
      activeCategory === 'all'
        ? CULTURE_SECTIONS_META
        : CULTURE_SECTIONS_META.filter((s) => s.id === activeCategory);

    return sections.map((meta) => ({
      ...meta,
      icon: SECTION_ICONS[meta.id] || Sparkles,
      title: meta.titles[lang] || meta.titles.en,
      items: CULTURE_ICONS.filter((item) => item.sectionId === meta.id),
    }));
  }, [activeCategory, lang]);

  const spotlightLoc = spotlightItem.locales[lang] || spotlightItem.locales.en;
  const selectedLoc = selectedIcon ? selectedIcon.locales[lang] || selectedIcon.locales.en : null;

  return (
    <main
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#080705] text-[#1A2332] dark:text-[#F5EFE6] pt-28 pb-24 font-sans relative overflow-hidden transition-colors duration-200"
    >
      {/* Subtle Mashrabiya / Pharaonic Lotus Geometric Gold Filigree Pattern */}
      <svg
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 w-full h-full opacity-[0.06] dark:opacity-[0.09] z-0"
      >
        <defs>
          <pattern id="egyptx-filigree" width="96" height="96" patternUnits="userSpaceOnUse">
            <path
              d="M48 4 L92 48 L48 92 L4 48 Z M48 18 L78 48 L48 78 L18 48 Z M48 4 L48 92 M4 48 L92 48"
              fill="none"
              stroke="#D6A044"
              strokeWidth="0.9"
            />
            <circle cx="48" cy="48" r="8" fill="none" stroke="#D6A044" strokeWidth="0.9" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#egyptx-filigree)" />
      </svg>

      {/* Warm Cairo-Sunset & Royal-Gold Radial Atmosphere */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[980px] h-[520px] bg-gradient-to-b from-[#D6A044]/20 via-[#76501F]/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-[#D6A044]/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-[#76501F]/15 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* ── MAJESTIC EGYPTIAN HERITAGE HERO ────────────────────────────── */}
        <header className="text-center max-w-3xl mx-auto mb-12">
          {/* Engraved Heritage Crest */}
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-[#21170D]/10 dark:bg-[#21170D] border border-[#D6A044]/50 flex items-center justify-center shadow-[0_0_30px_rgba(214,160,68,0.2)]">
            <Crown className="w-7 h-7 text-[#D6A044]" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6A044]/10 border border-[#D6A044]/35 text-xs font-semibold text-[#76501F] dark:text-[#F5DFA0] uppercase tracking-[0.18em] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#D6A044]" />
            <span>{ui.badge}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-[#1A2332] via-[#8A661C] to-[#D6A044] dark:from-[#FBF7EE] dark:via-[#F5DFA0] dark:to-[#D6A044] mb-3">
            {ui.title}
          </h1>

          <p className="text-lg sm:text-2xl text-[#8A661C] dark:text-[#D6A044] font-serif mb-3">
            {ui.subtitle}
          </p>

          <p className="text-sm sm:text-base text-slate-600 dark:text-[#CFC5B4] font-medium leading-relaxed">
            {ui.description}
          </p>
        </header>

        {/* ── INTERACTIVE CATEGORY FILTER BAR ────────────────────────────── */}
        <nav
          aria-label={ui.badge}
          className="flex flex-wrap items-center justify-center gap-2.5 mb-12"
        >
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
              activeCategory === 'all'
                ? 'bg-[#D6A044] text-[#080705] border-[#D6A044] shadow-[0_6px_20px_rgba(214,160,68,0.35)]'
                : 'bg-[#F8F3E9] dark:bg-[#14100B] text-[#1A2332] dark:text-[#E8DFCE] border-[#76501F]/35 hover:border-[#D6A044]/70'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>{ui.allHeritage}</span>
          </button>

          {CULTURE_SECTIONS_META.map((sec) => {
            const Icon = SECTION_ICONS[sec.id] || Sparkles;
            const isActive = activeCategory === sec.id;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveCategory(sec.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-200 cursor-pointer border ${
                  isActive
                    ? 'bg-[#D6A044] text-[#080705] border-[#D6A044] shadow-[0_6px_20px_rgba(214,160,68,0.35)]'
                    : 'bg-[#F8F3E9] dark:bg-[#14100B] text-[#1A2332] dark:text-[#E8DFCE] border-[#76501F]/35 hover:border-[#D6A044]/70'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{sec.titles[lang] || sec.titles.en}</span>
              </button>
            );
          })}
        </nav>

        {/* ── FEATURED CULTURAL SPOTLIGHT BANNER ─────────────────────────── */}
        <section className="mb-16">
          <div className="relative overflow-hidden rounded-3xl border border-[#76501F]/60 dark:border-[#D6A044]/40 bg-gradient-to-br from-[#F8F3E9] via-[#F2E9D8] to-[#EAE0CA] dark:from-[#14100A] dark:via-[#1C140C] dark:to-[#080705] shadow-[0_20px_60px_rgba(8,7,5,0.16)] dark:shadow-[0_24px_70px_rgba(0,0,0,0.65)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              {/* Framed Portrait */}
              <div className="lg:col-span-5 relative h-72 sm:h-80 lg:h-auto lg:min-h-[340px] overflow-hidden bg-[#120E09]">
                {spotlightItem.image && !spotlightImgError ? (
                  <>
                    <img
                      src={spotlightItem.image}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-35 pointer-events-none"
                    />
                    <img
                      src={spotlightItem.image}
                      alt={spotlightLoc.name}
                      onError={() => setSpotlightImgError(true)}
                      className="relative z-10 w-full h-full object-contain object-top transition-transform duration-500 hover:scale-[1.03]"
                    />
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#080705] via-[#21170D] to-[#76501F]/40 flex items-center justify-center">
                    <Crown className="w-16 h-16 text-[#D6A044]/70" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 z-10 bg-gradient-to-t from-[#0c0a08]/85 via-[#0c0a08]/40 to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#080705]/85 border border-[#D6A044]/50 text-[11px] font-bold text-[#F5DFA0] uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-[#D6A044]" />
                    {ui.spotlightLabel}
                  </span>
                </div>
              </div>

              {/* Editorial Legacy Details */}
              <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between text-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#D6A044]/15 border border-[#D6A044]/40 text-xs font-bold text-[#76501F] dark:text-[#F5DFA0]">
                      {spotlightLoc.epithet}
                    </span>
                    <span
                      dir="ltr"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 border border-[#76501F]/30 text-xs font-mono text-[#76501F] dark:text-[#E8DFCE]"
                    >
                      <Clock className="w-3 h-3 text-[#D6A044]" />
                      {spotlightItem.era}
                    </span>
                  </div>

                  <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#1A2332] dark:text-[#FBF7EE] mb-4">
                    {spotlightLoc.name}
                  </h2>

                  <blockquote className="relative p-4 rounded-2xl bg-[#080705]/[0.04] dark:bg-white/[0.04] border border-[#76501F]/25 mb-4">
                    <Quote className="w-4 h-4 text-[#D6A044] mb-1.5" />
                    <p className="text-sm sm:text-base font-serif italic text-[#1A2332]/90 dark:text-[#F5DFA0]">
                      {spotlightLoc.quote}
                    </p>
                  </blockquote>

                  <p className="text-sm sm:text-base text-slate-700 dark:text-[#CFC5B4] leading-relaxed mb-6">
                    {spotlightLoc.summary}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedIcon(spotlightItem)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D6A044] hover:bg-[#e5b359] text-[#080705] text-xs sm:text-sm font-bold tracking-wide transition-all shadow-[0_8px_24px_rgba(214,160,68,0.3)] cursor-pointer"
                  >
                    <span>{ui.exploreLegacy}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FILTERED HERITAGE SECTIONS ─────────────────────────────────── */}
        <div className="space-y-16">
          {visibleSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <div className="flex items-center justify-between border-b border-[#76501F]/35 pb-4 mb-8">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-[#D6A044]/15 border border-[#D6A044]/45 flex items-center justify-center text-[#D6A044]">
                      <SectionIcon className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1A2332] dark:text-[#FBF7EE]">
                      {section.title}
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-semibold text-[#76501F] dark:text-[#F5DFA0] bg-[#F8F3E9] dark:bg-[#14100B] px-3 py-1 rounded-full border border-[#76501F]/35 shadow-sm">
                    {section.items.length} {ui.iconsCountLabel}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {section.items.map((item) => (
                    <CultureCard
                      key={item.id}
                      item={item}
                      lang={lang}
                      ui={ui}
                      onSelect={setSelectedIcon}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      {/* ── CULTURAL HERITAGE DOSSIER MODAL ──────────────────────────────── */}
      {selectedIcon && selectedLoc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedLoc.name}
          onClick={() => setSelectedIcon(null)}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-[#FDFBF7] dark:bg-[#0D0A06] border border-[#D6A044]/60 shadow-[0_24px_80px_rgba(0,0,0,0.8)] text-start"
          >
            {/* Modal Header Image */}
            <div className="relative h-72 sm:h-80 w-full overflow-hidden bg-[#120E09]">
              {selectedIcon.image && !modalImgError ? (
                <>
                  <img
                    src={selectedIcon.image}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110 opacity-35 pointer-events-none"
                  />
                  <img
                    src={selectedIcon.image}
                    alt={selectedLoc.name}
                    onError={() => setModalImgError(true)}
                    className="relative z-10 w-full h-full object-contain object-top transition-transform duration-500"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#080705] via-[#21170D] to-[#76501F]/40 flex flex-col items-center justify-center gap-2">
                  <Crown className="w-12 h-12 text-[#D6A044]/75" />
                  <span className="font-serif text-3xl font-bold tracking-widest text-[#D6A044]/85">
                    {selectedLoc.name
                      .split(' ')
                      .filter(Boolean)
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                </div>
              )}
              <div className="absolute inset-x-0 bottom-0 h-28 z-10 bg-gradient-to-t from-[#0c0a08] via-[#0c0a08]/55 to-transparent pointer-events-none" />

              <button
                type="button"
                aria-label={ui.modalClose}
                onClick={() => setSelectedIcon(null)}
                className="absolute top-4 end-4 w-9 h-9 rounded-full bg-[#080705]/85 hover:bg-[#D6A044] text-[#F5EFE6] hover:text-[#080705] border border-[#D6A044]/50 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-5 right-5">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-0.5 rounded-full bg-[#080705]/85 border border-[#D6A044]/50 text-[11px] font-semibold text-[#F5DFA0]">
                    {selectedLoc.epithet}
                  </span>
                  <span
                    dir="ltr"
                    className="px-2.5 py-0.5 rounded-full bg-[#080705]/85 border border-white/20 text-[11px] font-mono text-[#F5EFE6]"
                  >
                    {selectedIcon.era}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif font-extrabold text-[#FBF7EE]">
                  {selectedLoc.name}
                </h3>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <blockquote className="p-4 rounded-2xl bg-[#D6A044]/10 border border-[#D6A044]/30">
                <Quote className="w-4 h-4 text-[#D6A044] mb-1" />
                <p className="text-sm sm:text-base font-serif italic text-[#1A2332] dark:text-[#F5DFA0]">
                  {selectedLoc.quote}
                </p>
              </blockquote>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8A661C] dark:text-[#D6A044] mb-2">
                  {ui.modalBioHeading}
                </h4>
                <p className="text-sm sm:text-base text-slate-700 dark:text-[#E8DFCE] leading-relaxed">
                  {selectedLoc.bio}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#8A661C] dark:text-[#D6A044] mb-3">
                  {ui.modalAchievementsHeading}
                </h4>
                <ul className="space-y-2">
                  {selectedLoc.achievements.map((ach, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2.5 text-sm text-[#1A2332] dark:text-[#CFC5B4]"
                    >
                      <Award className="w-4 h-4 text-[#D6A044] shrink-0 mt-0.5" />
                      <span>{ach}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#76501F]/25 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-500 dark:text-[#CFC5B4]/80">
                  <span className="font-semibold text-[#8A661C] dark:text-[#D6A044]">
                    {ui.modalEraHeading}:{' '}
                  </span>
                  <span dir="ltr" className="font-mono">
                    {selectedIcon.era}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <a
                    href={selectedIcon.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D6A044] hover:bg-[#e5b359] text-[#080705] text-xs font-bold transition-colors"
                  >
                    <span>{ui.modalExternalSource}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedIcon(null)}
                    className="px-4 py-2 rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 text-xs font-bold text-[#1A2332] dark:text-[#F5EFE6] transition-colors cursor-pointer"
                  >
                    {ui.modalClose}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
