'use client';

import React, { useState } from 'react';
import {
  Plane,
  Hotel,
  Utensils,
  Video,
  ExternalLink,
  Sparkles,
  MapPin,
  Star,
  Play,
  Globe2,
  Building,
  Home,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import {
  BOOKINGS_UI,
  AIRLINES_DATA,
  LUXURY_HOTELS,
  RESTAURANTS_DATA,
  VIDEOS_DATA,
  type BookingsLocale,
} from '@/lib/bookings-data';

type TabType = 'all' | 'flights' | 'hotels' | 'restaurants' | 'videos';

function normalizeBookingsLocale(locale: string): BookingsLocale {
  const short = (locale || 'en').toLowerCase().slice(0, 2) as BookingsLocale;
  return short in BOOKINGS_UI ? short : 'en';
}

const HOTEL_PLATFORMS = [
  {
    name: 'Booking.com Egypt',
    badge: 'Hotels & Cruises',
    url: 'https://www.booking.com/country/eg.html',
    icon: Building,
  },
  {
    name: 'Airbnb Egypt',
    badge: 'Villas & Lofts',
    url: 'https://www.airbnb.com/egypt',
    icon: Home,
  },
  {
    name: 'Hotels.com Egypt',
    badge: 'Member Rewards',
    url: 'https://www.hotels.com',
    icon: Hotel,
  },
];

export default function BookingsContent() {
  const { locale } = useLanguage();
  const lang = normalizeBookingsLocale(locale);
  const isRtl = lang === 'ar';
  const ui = BOOKINGS_UI[lang];

  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const tabs: Array<{ id: TabType; label: string; icon: typeof Globe2 }> = [
    { id: 'all', label: ui.tabAll, icon: Globe2 },
    { id: 'flights', label: ui.tabFlights, icon: Plane },
    { id: 'hotels', label: ui.tabHotels, icon: Hotel },
    { id: 'restaurants', label: ui.tabRestaurants, icon: Utensils },
    { id: 'videos', label: ui.tabVideos, icon: Video },
  ];

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#080705] text-slate-900 dark:text-[#F5EFE6] pt-28 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200"
    >
      {/* Subtle Pharaonic Ambient Glow */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[780px] h-[420px] bg-[#D6A044]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10 space-y-14">
        {/* Editorial Hero Header */}
        <header className="text-center space-y-5 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D6A044]/12 border border-[#D6A044]/40 text-[#8A661C] dark:text-[#FFD27A] text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D6A044]" />
            <span>{ui.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#21170D] via-[#9E7324] to-[#D6A044] dark:from-[#FFF8E7] dark:via-[#FFD27A] dark:to-[#D6A044]">
            {ui.heroTitle}
          </h1>

          <p className="text-slate-600 dark:text-[#F5EFE6]/75 text-sm sm:text-base leading-relaxed">
            {ui.heroSubtitle}
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-gradient-to-r from-[#D6A044] to-[#FFD27A] text-[#080705] border-[#D6A044] shadow-[0_6px_22px_rgba(214,160,68,0.35)]'
                      : 'bg-[#F8F3E9] dark:bg-[#17100A] hover:bg-[#F2E9D8] dark:hover:bg-[#21170D] text-slate-700 dark:text-[#F5EFE6]/85 border-slate-200 dark:border-[#76501F]/50 hover:border-[#D6A044]/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* SECTION 1: FLIGHTS TO EGYPT */}
        {(activeTab === 'all' || activeTab === 'flights') && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#76501F]/40 pb-4">
              <div className="p-2.5 rounded-xl bg-[#D6A044]/15 border border-[#D6A044]/40 text-[#8A661C] dark:text-[#FFD27A]">
                <Plane className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FFD27A]">
                  {ui.flightsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#F5EFE6]/70">
                  {ui.flightsSubtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {AIRLINES_DATA.map((airline) => (
                <div
                  key={airline.code}
                  className="group rounded-2xl p-6 bg-[#F8F3E9] dark:bg-gradient-to-br dark:from-[#1B130C] dark:to-[#110C08] border border-slate-200 dark:border-[#76501F]/60 hover:border-[#D6A044] transition-all duration-300 shadow-sm dark:shadow-[0_12px_32px_rgba(0,0,0,0.4)] flex flex-col justify-between gap-5"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D6A044] to-[#9E7324] text-[#080705] font-black text-base flex items-center justify-center shadow-md shrink-0">
                          {airline.code}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-[#FFF8E7]">
                            {airline.name[lang]}
                          </h3>
                          <span className="inline-block text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#D6A044]/15 text-[#8A661C] dark:text-[#FFD27A] border border-[#D6A044]/30 mt-1">
                            {airline.badge[lang]}
                          </span>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-[#080705]/60 border border-slate-200 dark:border-[#76501F]/50 text-xs font-bold text-[#8A661C] dark:text-[#FFD27A]">
                        <Star className="w-3.5 h-3.5 fill-[#D6A044] text-[#D6A044]" />
                        {airline.rating}
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-[#E2CB85] bg-white/80 dark:bg-[#080705]/50 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#76501F]/40">
                      <MapPin className="w-3.5 h-3.5 text-[#D6A044] shrink-0" />
                      <span>
                        {ui.hubLabel}: {airline.hub[lang]}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-[#F5EFE6]/80 leading-relaxed">
                      {airline.desc[lang]}
                    </p>
                  </div>

                  <a
                    href={airline.bookingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full sm:w-auto self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D6A044] to-[#FFD27A] hover:brightness-105 text-[#080705] font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                  >
                    <span>{ui.bookNow}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 2: LUXURY PALACES & HOTELS */}
        {(activeTab === 'all' || activeTab === 'hotels') && (
          <section className="space-y-8">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#76501F]/40 pb-4">
              <div className="p-2.5 rounded-xl bg-[#D6A044]/15 border border-[#D6A044]/40 text-[#8A661C] dark:text-[#FFD27A]">
                <Hotel className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FFD27A]">
                  {ui.hotelsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#F5EFE6]/70">
                  {ui.hotelsSubtitle}
                </p>
              </div>
            </div>

            {/* Luxury Palace Visual Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {LUXURY_HOTELS.map((hotel) => (
                <div
                  key={hotel.id}
                  className="group rounded-2xl overflow-hidden bg-[#F8F3E9] dark:bg-gradient-to-br dark:from-[#1B130C] dark:to-[#110C08] border border-slate-200 dark:border-[#76501F]/60 hover:border-[#D6A044] transition-all duration-300 shadow-sm dark:shadow-[0_14px_36px_rgba(0,0,0,0.45)] flex flex-col"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={hotel.image}
                      alt={hotel.name[lang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0906] via-[#0D0906]/45 to-transparent" />

                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-full bg-[#080705]/80 backdrop-blur-md border border-[#D6A044]/50 text-[#FFD27A] text-[11px] font-semibold">
                        {hotel.highlight[lang]}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#080705]/80 backdrop-blur-md border border-[#D6A044]/40 text-[#FFD27A] text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#D6A044] text-[#D6A044]" />
                        {hotel.rating}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg sm:text-xl font-bold text-[#FFF8E7] leading-snug">
                        {hotel.name[lang]}
                      </h3>
                      <p className="text-xs text-[#E2CB85] flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{hotel.location[lang]}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <p className="text-sm text-slate-600 dark:text-[#F5EFE6]/80 leading-relaxed">
                      {hotel.desc[lang]}
                    </p>

                    <a
                      href={hotel.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D6A044] to-[#FFD27A] hover:brightness-105 text-[#080705] font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                    >
                      <span>{ui.bookStay}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Hotel Platforms Strip */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#8A661C] dark:text-[#D6A044]">
                {ui.platformsTitle}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {HOTEL_PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <a
                      key={platform.name}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-4 rounded-xl bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/60 hover:border-[#D6A044] transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-[#D6A044]/15 text-[#8A661C] dark:text-[#FFD27A]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-900 dark:text-[#FFF8E7]">
                            {platform.name}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-[#F5EFE6]/65">
                            {platform.badge}
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-[#D6A044] group-hover:translate-x-0.5 transition-transform" />
                    </a>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* SECTION 3: SIGNATURE EGYPTIAN DINING */}
        {(activeTab === 'all' || activeTab === 'restaurants') && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#76501F]/40 pb-4">
              <div className="p-2.5 rounded-xl bg-[#D6A044]/15 border border-[#D6A044]/40 text-[#8A661C] dark:text-[#FFD27A]">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FFD27A]">
                  {ui.restaurantsTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#F5EFE6]/70">
                  {ui.restaurantsSubtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {RESTAURANTS_DATA.map((venue) => (
                <div
                  key={venue.id}
                  className="group rounded-2xl overflow-hidden bg-[#F8F3E9] dark:bg-gradient-to-br dark:from-[#1B130C] dark:to-[#110C08] border border-slate-200 dark:border-[#76501F]/60 hover:border-[#D6A044] transition-all duration-300 shadow-sm dark:shadow-[0_14px_36px_rgba(0,0,0,0.45)] flex flex-col"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={venue.image}
                      alt={venue.name[lang]}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0D0906] via-[#0D0906]/45 to-transparent" />

                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full bg-[#080705]/80 backdrop-blur-md border border-[#D6A044]/50 text-[#FFD27A] text-[11px] font-semibold">
                        {venue.cuisine[lang]}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg sm:text-xl font-bold text-[#FFF8E7]">
                        {venue.name[lang]}
                      </h3>
                      <p className="text-xs text-[#E2CB85] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span>{venue.location[lang]}</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-2.5">
                      <p className="text-sm text-slate-600 dark:text-[#F5EFE6]/80 leading-relaxed">
                        {venue.desc[lang]}
                      </p>
                      <div className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white/80 dark:bg-[#080705]/55 border border-slate-200 dark:border-[#76501F]/40 text-[#8A661C] dark:text-[#FFD27A]">
                        <span className="font-bold">{ui.signatureLabel}:</span>{' '}
                        {venue.signature[lang]}
                      </div>
                    </div>

                    <a
                      href={venue.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto self-start px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D6A044] to-[#FFD27A] hover:brightness-105 text-[#080705] font-bold text-xs uppercase tracking-wider shadow-md transition-all"
                    >
                      <span>{ui.reserveTable}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 4: OFFICIAL HERITAGE REELS */}
        {(activeTab === 'all' || activeTab === 'videos') && (
          <section className="space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-[#76501F]/40 pb-4">
              <div className="p-2.5 rounded-xl bg-[#D6A044]/15 border border-[#D6A044]/40 text-[#8A661C] dark:text-[#FFD27A]">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#FFD27A]">
                  {ui.videosTitle}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-[#F5EFE6]/70">
                  {ui.videosSubtitle}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {VIDEOS_DATA.map((video) => {
                const isPlaying = activeVideoId === video.id;
                return (
                  <div
                    key={video.id}
                    className="rounded-2xl overflow-hidden bg-[#F8F3E9] dark:bg-gradient-to-br dark:from-[#1B130C] dark:to-[#110C08] border border-slate-200 dark:border-[#76501F]/60 hover:border-[#D6A044] transition-all flex flex-col"
                  >
                    <div className="relative aspect-video bg-black">
                      {isPlaying ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                          title={video.title[lang]}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveVideoId(video.id)}
                          className="relative w-full h-full group cursor-pointer block"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
                            alt={video.title[lang]}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#080705]/90 via-[#080705]/30 to-transparent" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="w-14 h-14 rounded-full bg-gradient-to-r from-[#D6A044] to-[#FFD27A] text-[#080705] flex items-center justify-center shadow-[0_0_25px_rgba(214,160,68,0.6)] group-hover:scale-110 transition-transform">
                              <Play className="w-6 h-6 fill-current ml-0.5" />
                            </span>
                          </div>
                        </button>
                      )}
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-semibold text-[#8A661C] dark:text-[#D6A044] uppercase tracking-wider">
                          {video.source[lang]}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-[#FFF8E7] mt-1">
                          {video.title[lang]}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-[#F5EFE6]/75 mt-2 leading-relaxed">
                          {video.desc[lang]}
                        </p>
                      </div>

                      {!isPlaying && (
                        <button
                          type="button"
                          onClick={() => setActiveVideoId(video.id)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#8A661C] dark:text-[#FFD27A] hover:underline self-start cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5" />
                          <span>{ui.watchReel}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Official Partner Disclaimer */}
        <div className="rounded-2xl bg-[#F8F3E9] dark:bg-[#17100A] border border-slate-200 dark:border-[#76501F]/50 px-5 py-4 flex items-center gap-3 text-xs text-slate-600 dark:text-[#F5EFE6]/75">
          <ShieldCheck className="w-4 h-4 text-[#D6A044] shrink-0" />
          <span>{ui.officialNote}</span>
        </div>
      </div>
    </div>
  );
}
