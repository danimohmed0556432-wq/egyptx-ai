"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Compass,
  MapPin,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Calendar,
  X,
  Landmark,
  BookOpen,
  Layers,
  Award,
  Crown,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  NATIONAL_PROJECTS_LIST,
  NATIONAL_PROJECTS_PAGE_UI,
  ProjectCategoryId,
  NationalProjectItem,
  SupportedLocale,
} from '@/data/nationalHeritageProjects';

const CATEGORY_ORDER: ProjectCategoryId[] = [
  'all',
  'smart_cities',
  'museums_antiquities',
  'infrastructure_transport',
  'clean_energy_dev',
];

export default function NationalProjectsPage() {
  const { locale } = useLanguage();
  const activeLocale: SupportedLocale =
    locale in NATIONAL_PROJECTS_PAGE_UI ? (locale as SupportedLocale) : 'en';
  const ui = NATIONAL_PROJECTS_PAGE_UI[activeLocale];
  const isRtl = activeLocale === 'ar';

  const [selectedCategory, setSelectedCategory] = useState<ProjectCategoryId>('all');
  const [activeProjectModal, setActiveProjectModal] = useState<NationalProjectItem | null>(null);
  const [imgFallbacks, setImgFallbacks] = useState<Record<string, boolean>>({});

  const featuredProject = NATIONAL_PROJECTS_LIST.find((p) => p.featured);
  const showFeaturedSpotlight =
    Boolean(featuredProject) &&
    (selectedCategory === 'all' || selectedCategory === featuredProject?.category);

  const filteredProjects = NATIONAL_PROJECTS_LIST.filter((project) => {
    if (showFeaturedSpotlight && project.id === featuredProject?.id) return false;
    if (selectedCategory === 'all') return true;
    return project.category === selectedCategory;
  });

  const getProjectImage = (project: NationalProjectItem) =>
    imgFallbacks[project.id] ? project.fallbackImageUrl : project.imageUrl;

  const markImageFallback = (projectId: string) => {
    setImgFallbacks((prev) => (prev[projectId] ? prev : { ...prev, [projectId]: true }));
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen bg-cover bg-center bg-no-repeat bg-fixed text-gray-900 dark:text-white font-sans selection:bg-amber-500 selection:text-black"
      style={{ backgroundImage: "url('/Golden Hieroglyphs at Sunset.png')" }}
    >
      {/* Adaptive Pharaonic Overlay */}
      <div className="absolute inset-0 bg-[#FDFBF7]/92 dark:bg-[#080705]/88 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* ── TOP HEADER ────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-40 px-4 sm:px-8 py-4 bg-[#FDFBF7]/90 dark:bg-[#080705]/85 backdrop-blur-xl border-b border-[#D6A044]/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-white/10 transition-colors"
              title={ui.backHome}
              aria-label={ui.backHome}
            >
              <ArrowLeft
                className={`w-5 h-5 text-amber-600 dark:text-[#D6A044] ${isRtl ? 'rotate-180' : ''}`}
              />
            </Link>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-amber-500 dark:from-[#F6E2B3] dark:via-[#D6A044] dark:to-amber-500">
                {ui.headerTitle}
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400 font-light hidden sm:block">
                {ui.headerSubtitle}
              </p>
            </div>
          </div>

          <Link
            href="/planner"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D6A044]/20 to-amber-500/20 hover:from-[#D6A044]/30 hover:to-amber-500/30 border border-[#D6A044]/40 text-amber-800 dark:text-[#F6E2B3] text-xs font-semibold transition-all cursor-pointer shadow-md shrink-0"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{ui.planTour}</span>
            <span className="sm:hidden">{ui.planShort}</span>
          </Link>
        </header>

        {/* ── HERO BANNER SECTION ───────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D6A044]/15 border border-[#D6A044]/35 text-amber-800 dark:text-[#F6E2B3] text-xs font-semibold mb-4 shadow-[0_0_20px_rgba(214,160,68,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#D6A044]" />
            <span>{ui.eyebrow}</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-gray-900 dark:text-white mb-4 leading-tight">
            {ui.heroTitle}{' '}
            <span className="block sm:inline bg-clip-text text-transparent bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 dark:from-[#F6E2B3] dark:via-[#D6A044] dark:to-amber-500">
              {ui.heroTitleAccent}
            </span>
          </h2>

          <p className="max-w-3xl mx-auto text-sm sm:text-base text-gray-700 dark:text-gray-300 font-light leading-relaxed mb-8">
            {ui.heroSubtitle}
          </p>

          {/* Key Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto mb-10">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F3E9]/90 dark:bg-white/5 border border-[#D6A044]/25 backdrop-blur-md">
              <span className="text-xl sm:text-2xl font-black text-amber-700 dark:text-[#F6E2B3] block">
                {ui.kpi1Value}
              </span>
              <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                {ui.kpi1Label}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F3E9]/90 dark:bg-white/5 border border-[#D6A044]/25 backdrop-blur-md">
              <span className="text-xl sm:text-2xl font-black text-amber-700 dark:text-[#F6E2B3] block">
                {ui.kpi2Value}
              </span>
              <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                {ui.kpi2Label}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F3E9]/90 dark:bg-white/5 border border-[#D6A044]/25 backdrop-blur-md">
              <span className="text-xl sm:text-2xl font-black text-amber-700 dark:text-[#F6E2B3] block">
                {ui.kpi3Value}
              </span>
              <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                {ui.kpi3Label}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#F8F3E9]/90 dark:bg-white/5 border border-[#D6A044]/25 backdrop-blur-md">
              <span className="text-xl sm:text-2xl font-black text-amber-700 dark:text-[#F6E2B3] block">
                {ui.kpi4Value}
              </span>
              <span className="text-[11px] text-gray-600 dark:text-gray-400 font-medium">
                {ui.kpi4Label}
              </span>
            </div>
          </div>

          {/* ── FILTER TABS ─────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2">
            {CATEGORY_ORDER.map((catId) => {
              const isActive = selectedCategory === catId;
              return (
                <button
                  key={catId}
                  onClick={() => setSelectedCategory(catId)}
                  className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D6A044] to-amber-400 text-[#080705] shadow-[0_0_20px_rgba(214,160,68,0.45)] scale-105'
                      : 'bg-[#F8F3E9] dark:bg-white/5 hover:bg-[#EFE6D5] dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-white/10 hover:border-[#D6A044]/40'
                  }`}
                >
                  {ui.categories[catId]}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── #1 FLAGSHIP SPOTLIGHT: NEW ADMINISTRATIVE CAPITAL ───────────── */}
        {showFeaturedSpotlight && featuredProject && (
          <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="group relative rounded-3xl overflow-hidden bg-white/95 dark:bg-[#110E0A]/95 border-2 border-[#D6A044]/55 shadow-[0_0_40px_rgba(214,160,68,0.2)] grid grid-cols-1 lg:grid-cols-12"
            >
              {/* Flagship Image */}
              <div className="relative h-64 sm:h-80 lg:h-auto lg:col-span-6 overflow-hidden bg-[#080705]">
                <img
                  src={getProjectImage(featuredProject)}
                  alt={featuredProject.title[activeLocale]}
                  onError={() => markImageFallback(featuredProject.id)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-[#080705]/20 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#080705]/30" />

                <div className={`absolute top-4 ${isRtl ? 'right-4' : 'left-4'} z-10`}>
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-[#D6A044] to-amber-300 text-[#080705] shadow-lg">
                    <Crown className="w-3.5 h-3.5" />
                    {ui.flagshipBadge}
                  </span>
                </div>

                <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} z-10`}>
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-black/75 backdrop-blur-md text-gray-200 border border-white/15">
                    <Calendar className="w-3.5 h-3.5 text-[#D6A044]" />
                    {featuredProject.year}
                  </span>
                </div>
              </div>

              {/* Flagship Details */}
              <div className="p-6 sm:p-8 lg:col-span-6 flex flex-col justify-between space-y-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-[#D6A044]/15 text-amber-800 dark:text-[#F6E2B3] border border-[#D6A044]/40">
                      {ui.categories[featuredProject.category]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-amber-700 dark:text-[#D6A044] font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      {featuredProject.location[activeLocale]}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                    {featuredProject.title[activeLocale]}
                  </h3>

                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {featuredProject.description[activeLocale]}
                  </p>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed bg-[#F8F3E9] dark:bg-white/5 p-3.5 rounded-xl border border-[#D6A044]/20">
                    {featuredProject.architecturalHighlights[activeLocale]}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      {featuredProject.highlight[activeLocale]}
                    </span>
                    <span className="text-xs font-mono text-amber-700 dark:text-[#D6A044] font-bold block">
                      {featuredProject.stats[activeLocale]}
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveProjectModal(featuredProject)}
                    className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D6A044] to-amber-400 text-[#080705] font-bold text-xs shadow-lg hover:shadow-[#D6A044]/40 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>{ui.exploreMilestone}</span>
                    <ChevronRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        {/* ── PROJECTS GRID ─────────────────────────────────────────────── */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20 flex-1 w-full">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            <AnimatePresence>
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35 }}
                  className="group relative bg-white/90 dark:bg-[#110E0A]/90 border border-[#D6A044]/25 hover:border-[#D6A044]/60 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl hover:shadow-[0_0_35px_rgba(214,160,68,0.2)] transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image Container */}
                  <div className="relative w-full h-52 sm:h-56 overflow-hidden bg-[#080705]">
                    <img
                      src={getProjectImage(project)}
                      alt={project.title[activeLocale]}
                      onError={() => markImageFallback(project.id)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />

                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#080705] via-[#080705]/25 to-transparent" />

                    {/* Category Badge */}
                    <div className={`absolute top-3 ${isRtl ? 'right-3' : 'left-3'} z-10`}>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-[#F6E2B3] border border-[#D6A044]/40">
                        {ui.categories[project.category]}
                      </span>
                    </div>

                    {/* Year Badge */}
                    <div className={`absolute top-3 ${isRtl ? 'left-3' : 'right-3'} z-10`}>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-black/70 backdrop-blur-md text-gray-200 border border-white/15">
                        <Calendar className="w-3 h-3 text-[#D6A044]" />
                        {project.year}
                      </span>
                    </div>

                    {/* Location Tag */}
                    <div
                      className={`absolute bottom-3 ${isRtl ? 'right-3' : 'left-3'} z-10 flex items-center gap-1 text-xs text-amber-200 font-medium drop-shadow-md`}
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#D6A044] shrink-0" />
                      <span>{project.location[activeLocale]}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-amber-700 dark:group-hover:text-[#F6E2B3] transition-colors mb-2 leading-snug">
                        {project.title[activeLocale]}
                      </h3>

                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-light line-clamp-3">
                        {project.description[activeLocale]}
                      </p>
                    </div>

                    {/* Highlights & CTA */}
                    <div className="pt-4 border-t border-gray-200 dark:border-white/10 space-y-3">
                      <div className="flex items-center justify-between gap-2 text-[11px]">
                        <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1 min-w-0">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span className="truncate">{project.highlight[activeLocale]}</span>
                        </span>
                        <span className="font-mono text-amber-700 dark:text-[#D6A044] font-semibold shrink-0">
                          {project.stats[activeLocale]}
                        </span>
                      </div>

                      <button
                        onClick={() => setActiveProjectModal(project)}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#F8F3E9] dark:bg-white/5 hover:bg-[#D6A044]/20 border border-gray-200 dark:border-white/10 hover:border-[#D6A044]/40 text-xs font-bold text-gray-800 dark:text-gray-200 hover:text-amber-800 dark:hover:text-[#F6E2B3] transition-all flex items-center justify-center gap-1.5 cursor-pointer group-hover:bg-[#D6A044]/10"
                      >
                        <span>{ui.exploreMilestone}</span>
                        <ChevronRight
                          className={`w-3.5 h-3.5 text-[#D6A044] transition-transform ${
                            isRtl
                              ? 'rotate-180 group-hover:-translate-x-1'
                              : 'group-hover:translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </main>

        {/* ── INTERACTIVE DOSSIER MODAL ─────────────────────────────────── */}
        <AnimatePresence>
          {activeProjectModal && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
              onClick={() => setActiveProjectModal(null)}
            >
              <motion.div
                dir={isRtl ? 'rtl' : 'ltr'}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#FDFBF7] dark:bg-[#0C0A07] border border-[#D6A044]/45 rounded-3xl shadow-2xl text-gray-900 dark:text-white"
              >
                {/* Modal Image */}
                <div className="relative h-56 sm:h-68 w-full bg-[#080705]">
                  <img
                    src={getProjectImage(activeProjectModal)}
                    alt={activeProjectModal.title[activeLocale]}
                    onError={() => markImageFallback(activeProjectModal.id)}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A07] via-[#0C0A07]/35 to-transparent" />

                  <button
                    onClick={() => setActiveProjectModal(null)}
                    aria-label={ui.closeBtn}
                    className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-full bg-black/65 hover:bg-black/85 text-white/85 hover:text-white border border-white/20 transition-all cursor-pointer`}
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div className={`absolute bottom-4 ${isRtl ? 'right-6' : 'left-6'}`}>
                    <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D6A044]/30 text-[#F6E2B3] border border-[#D6A044]/50 backdrop-blur-md">
                      {ui.categories[activeProjectModal.category]}
                    </span>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white leading-snug">
                      {activeProjectModal.title[activeLocale]}
                    </h3>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                    {activeProjectModal.description[activeLocale]}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block uppercase font-mono">
                        {ui.locationLabel}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">
                        {activeProjectModal.location[activeLocale]}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-gray-200 dark:border-white/10">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block uppercase font-mono">
                        {ui.timelineLabel}
                      </span>
                      <span className="text-xs font-bold text-gray-900 dark:text-white font-mono">
                        {activeProjectModal.year}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-[#F8F3E9] dark:bg-white/5 border border-gray-200 dark:border-white/10 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 block uppercase font-mono">
                        {ui.impactMetricLabel}
                      </span>
                      <span className="text-xs font-bold text-amber-700 dark:text-[#D6A044] font-mono">
                        {activeProjectModal.stats[activeLocale]}
                      </span>
                    </div>
                  </div>

                  {/* Dossier Sections */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-2xl bg-[#F8F3E9]/80 dark:bg-white/5 border border-[#D6A044]/20">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-[#D6A044] mb-1.5 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>{ui.overviewContextLabel}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {activeProjectModal.historicalContext[activeLocale]}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8F3E9]/80 dark:bg-white/5 border border-[#D6A044]/20">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-[#D6A044] mb-1.5 flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>{ui.engineeringHighlightsLabel}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {activeProjectModal.architecturalHighlights[activeLocale]}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#F8F3E9]/80 dark:bg-white/5 border border-[#D6A044]/20">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-[#D6A044] mb-1.5 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>{ui.nationalImpactLabel}</span>
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {activeProjectModal.heritageImpact[activeLocale]}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => setActiveProjectModal(null)}
                      className="px-5 py-2.5 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/15 text-gray-900 dark:text-white font-semibold text-xs cursor-pointer transition-all"
                    >
                      {ui.closeBtn}
                    </button>
                    <Link
                      href="/planner"
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#D6A044] to-amber-400 text-[#080705] font-bold text-xs shadow-lg hover:shadow-[#D6A044]/30 transition-all flex items-center gap-1.5"
                    >
                      <Landmark className="w-3.5 h-3.5" />
                      <span>{ui.addToItineraryBtn}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
