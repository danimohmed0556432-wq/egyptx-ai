'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, UtensilsCrossed, Bus, Palette, 
  Sparkles, Calendar, Users, DollarSign, Star, 
  Tag, Percent, CheckCircle2, SlidersHorizontal, 
  PlusCircle, TrendingUp, ShieldCheck,
  Radio, Activity, Sun, Moon, Bell,
  Globe, X
} from 'lucide-react';

type BusinessType = 'Hotels' | 'Restaurants' | 'Tour Companies' | 'Artisans';

interface OfferItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  status: 'Active' | 'Paused';
  redemptions: number;
  validUntil: string;
  type: 'discount' | 'perk';
  isGlobalBroadcast?: boolean;
}

interface BroadcastNotification {
  id: string;
  businessName: string;
  message: string;
  timestamp: string;
  badge: string;
  touristCount: string;
}

const BUSINESS_TYPES: { id: BusinessType; icon: React.ElementType; label: string }[] = [
  { id: 'Hotels', icon: Building2, label: 'Hotels' },
  { id: 'Restaurants', icon: UtensilsCrossed, label: 'Restaurants' },
  { id: 'Tour Companies', icon: Bus, label: 'Tour Companies' },
  { id: 'Artisans', icon: Palette, label: 'Artisans' },
];

const KPI_CONFIG: Record<BusinessType, { label: string; icon: React.ElementType; hint: string }[]> = {
  'Hotels': [
    { label: 'BOOKINGS', icon: Calendar, hint: 'Direct reservation telemetry' },
    { label: 'TOURISTS REACHED', icon: Users, hint: 'Verified EgyptX app travelers' },
    { label: 'REVENUE', icon: DollarSign, hint: 'Net verified transactions' },
    { label: 'AVERAGE RATING', icon: Star, hint: 'Verified guest satisfaction' },
  ],
  'Restaurants': [
    { label: 'RESERVATIONS', icon: Calendar, hint: 'Table bookings through portal' },
    { label: 'DINERS REACHED', icon: Users, hint: 'Food and dining discovery views' },
    { label: 'REVENUE', icon: DollarSign, hint: 'Direct dining spend' },
    { label: 'AVERAGE RATING', icon: Star, hint: 'Gastronomy feedback score' },
  ],
  'Tour Companies': [
    { label: 'EXPEDITIONS', icon: Calendar, hint: 'Guided tour reservations' },
    { label: 'EXPLORERS REACHED', icon: Users, hint: 'Itinerary seekers and adventurers' },
    { label: 'REVENUE', icon: DollarSign, hint: 'Package bookings revenue' },
    { label: 'AVERAGE RATING', icon: Star, hint: 'Excursion quality rating' },
  ],
  'Artisans': [
    { label: 'ARTISAN ORDERS', icon: Tag, hint: 'Authentic craft orders' },
    { label: 'COLLECTORS REACHED', icon: Users, hint: 'Heritage craft seekers' },
    { label: 'REVENUE', icon: DollarSign, hint: 'Direct artisan payouts' },
    { label: 'AVERAGE RATING', icon: Star, hint: 'Authenticity and craft rating' },
  ],
};

const INITIAL_OFFERS: Record<BusinessType, OfferItem[]> = {
  'Hotels': [
    {
      id: 'offer-1',
      title: '20% Off Stays for EgyptX Verified Tourists',
      description: 'Exclusive luxury suite and deluxe room discount for international visitors.',
      badge: '20% OFF',
      status: 'Active',
      redemptions: 342,
      validUntil: 'Dec 31, 2026',
      type: 'discount',
      isGlobalBroadcast: true
    },
    {
      id: 'offer-2',
      title: 'Complimentary VIP Airport Transfer',
      description: 'Free private chauffeur transfer for bookings of 3 nights or more.',
      badge: 'VIP PERK',
      status: 'Active',
      redemptions: 189,
      validUntil: 'Nov 30, 2026',
      type: 'perk',
      isGlobalBroadcast: false
    }
  ],
  'Restaurants': [
    {
      id: 'offer-3',
      title: '15% Off Authentic Egyptian Tasting Menu',
      description: 'Valid for dinner seating when presenting EgyptX Smart Navigator.',
      badge: '15% OFF',
      status: 'Active',
      redemptions: 215,
      validUntil: 'Dec 15, 2026',
      type: 'discount',
      isGlobalBroadcast: true
    }
  ],
  'Tour Companies': [
    {
      id: 'offer-4',
      title: 'Private Stargazing Safari - 25% Off',
      description: 'Exclusive Fayoum Magic Lake evening excursion discount.',
      badge: '25% OFF',
      status: 'Active',
      redemptions: 98,
      validUntil: 'Jan 15, 2027',
      type: 'discount',
      isGlobalBroadcast: true
    }
  ],
  'Artisans': [
    {
      id: 'offer-5',
      title: 'Free Hand-Carved Alabaster Keepsake',
      description: 'Complimentary certified artisan souvenir with orders over $50.',
      badge: 'FREE GIFT',
      status: 'Active',
      redemptions: 147,
      validUntil: 'Dec 31, 2026',
      type: 'perk',
      isGlobalBroadcast: false
    }
  ]
};

const MOCK_BROADCASTS: BroadcastNotification[] = [
  {
    id: 'b-1',
    businessName: 'Marriott Hotel',
    message: 'just published a 20% discount!',
    timestamp: 'Just now',
    badge: '20% OFF',
    touristCount: '48,200+'
  },
  {
    id: 'b-2',
    businessName: 'Kempinski Nile Hotel',
    message: 'launched Complimentary Airport VIP Transfer',
    timestamp: '2m ago',
    badge: 'VIP PERK',
    touristCount: '48,200+'
  },
  {
    id: 'b-3',
    businessName: 'Siwa Eco-Lodge Safari',
    message: 'activated 25% Off Desert Stargazing Expedition',
    timestamp: '5m ago',
    badge: '25% OFF',
    touristCount: '48,200+'
  }
];

export default function BusinessPortalContent() {
  const [activeTab, setActiveTab] = useState<BusinessType>('Hotels');
  const [offers, setOffers] = useState<Record<BusinessType, OfferItem[]>>(INITIAL_OFFERS);
  
  // Independent Light/Dark Theme handler (seamless with next-themes & Tailwind dark: class)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.documentElement.getAttribute('data-theme') === 'dark' ||
                     !document.documentElement.classList.contains('light');
      setIsDarkMode(isDark);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);

    const root = document.documentElement;
    const body = document.body;

    if (nextMode) {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      if (body) {
        body.classList.add('dark');
        body.classList.remove('light');
      }
      try {
        localStorage.setItem('theme', 'dark');
        localStorage.setItem('egyptx-theme', 'dark');
      } catch (e) {
        // storage ignored
      }
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      if (body) {
        body.classList.add('light');
        body.classList.remove('dark');
      }
      try {
        localStorage.setItem('theme', 'light');
        localStorage.setItem('egyptx-theme', 'light');
      } catch (e) {
        // storage ignored
      }
    }
  };

  // Live Toast Notification State
  const [activeBroadcast, setActiveBroadcast] = useState<BroadcastNotification | null>(MOCK_BROADCASTS[0]);
  const [showToast, setShowToast] = useState(true);

  // Form State
  const [offerTitle, setOfferTitle] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [badgeText, setBadgeText] = useState('20% OFF');
  const [broadcastGlobally, setBroadcastGlobally] = useState(true);
  const [formSuccess, setFormSuccess] = useState(false);

  // Periodic rotation of live global feed notifications
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % MOCK_BROADCASTS.length;
      setActiveBroadcast(MOCK_BROADCASTS[index]);
      setShowToast(true);
    }, 12000);

    return () => clearInterval(interval);
  }, []);

  const handleLaunchOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerTitle.trim()) return;

    const newOffer: OfferItem = {
      id: `offer-${Date.now()}`,
      title: offerTitle.trim(),
      description: offerDiscount.trim() || 'Exclusive promotion powered by EgyptX AI.',
      badge: badgeText.trim() || 'SPECIAL OFFER',
      status: 'Active',
      redemptions: 0,
      validUntil: validUntil || 'Dec 31, 2026',
      type: badgeText.toLowerCase().includes('off') ? 'discount' : 'perk',
      isGlobalBroadcast: broadcastGlobally
    };

    setOffers(prev => ({
      ...prev,
      [activeTab]: [newOffer, ...prev[activeTab]]
    }));

    if (broadcastGlobally) {
      setActiveBroadcast({
        id: `broadcast-${Date.now()}`,
        businessName: `${activeTab} Partner`,
        message: `just published "${offerTitle.trim()}" globally!`,
        timestamp: 'Just now',
        badge: badgeText.trim(),
        touristCount: '48,200+'
      });
      setShowToast(true);
    }

    setOfferTitle('');
    setOfferDiscount('');
    setValidUntil('');
    setFormSuccess(true);
    setTimeout(() => setFormSuccess(false), 5000);
  };

  const handleToggleStatus = (id: string) => {
    setOffers(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(item => 
        item.id === id ? { ...item, status: item.status === 'Active' ? 'Paused' : 'Active' } : item
      )
    }));
  };

  const activeOffersList = offers[activeTab] || [];

  return (
    <div className="relative min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-gray-900 dark:text-gray-100 pt-28 pb-24 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Background Ambient Glow Elements */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-[550px] h-[550px] bg-blue-500/10 dark:bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-[600px] h-[600px] bg-amber-400/5 dark:bg-purple-600/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Subtle Pattern Grid */}
      <div 
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(0, 0, 0, 0.4) 1px, transparent 1px)`,
          backgroundSize: '32px 32px'
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Global Broadcast Live Floating Toast */}
        <AnimatePresence>
          {showToast && activeBroadcast && (
            <motion.div 
              initial={{ opacity: 0, y: -25, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -25, scale: 0.95 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="fixed top-24 right-4 sm:right-8 z-50 max-w-md w-[calc(100%-2rem)] sm:w-auto"
            >
              <div className="bg-white/95 dark:bg-[#111A2E]/95 backdrop-blur-2xl border border-amber-400/40 dark:border-amber-500/40 rounded-2xl p-4 shadow-[0_12px_40px_rgba(245,158,11,0.2)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.6)] flex items-start gap-3.5">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold shrink-0 shadow-md">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                
                <div className="flex-1 pr-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Radio className="w-3 h-3" />
                      Live Global Feed
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-slate-400 ml-auto">
                      {activeBroadcast.timestamp}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-slate-200 leading-snug">
                    <strong className="font-bold text-gray-900 dark:text-white">New Alert: {activeBroadcast.businessName}</strong> {activeBroadcast.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                      {activeBroadcast.badge}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1">
                      <Globe className="w-3 h-3 text-emerald-500" />
                      Broadcasted to {activeBroadcast.touristCount} Tourists
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => setShowToast(false)}
                  className="text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 text-xs font-semibold tracking-wider uppercase mb-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live B2B Tourism Ecosystem
            </div>

            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-200 dark:via-amber-400 dark:to-amber-500 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-sm"
            >
              Tourism Business Portal
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-600 dark:text-slate-400 font-bold tracking-widest uppercase text-xs sm:text-sm mt-2 flex items-center gap-2"
            >
              Grow Your Business With EgyptX AI
            </motion.p>
          </div>

          {/* Action Bar: Light/Dark Mode Toggle & Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Mockup Light/Dark Mode Toggle Button */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={toggleTheme}
              title={`Switch to ${isDarkMode ? 'Light' : 'Dark'} Mode`}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white/90 dark:bg-[#121B2B]/90 backdrop-blur-xl border border-gray-200/90 dark:border-white/10 text-gray-700 dark:text-amber-300 shadow-sm hover:shadow transition-all"
            >
              <div className="relative w-4 h-4 flex items-center justify-center">
                {isDarkMode ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-4 h-4 text-amber-600" />
                )}
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider hidden sm:inline">
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </motion.button>

            {/* Business Type Selector (Tabs) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 }}
              className="flex flex-wrap items-center gap-1.5 bg-white/90 dark:bg-[#121B2B]/90 backdrop-blur-xl p-1.5 rounded-2xl border border-gray-200/90 dark:border-white/10 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            >
              {BUSINESS_TYPES.map((type) => {
                const Icon = type.icon;
                const isActive = activeTab === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setActiveTab(type.id)}
                    className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-gray-500 dark:text-slate-400'}`} />
                    {type.label}
                  </button>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Top Stats Row (4 Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <AnimatePresence mode="wait">
            {KPI_CONFIG[activeTab].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div 
                  key={`${activeTab}-${idx}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ delay: idx * 0.05, duration: 0.2 }}
                  className="group relative bg-white/85 dark:bg-[#111A2E]/70 backdrop-blur-xl border border-gray-200/90 dark:border-white/10 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 shadow-sm hover:shadow-md dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden"
                >
                  {/* Subtle Top Line Accent */}
                  <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent group-hover:via-amber-500/70 transition-all duration-500" />
                  
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{stat.label}</p>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all duration-300">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Dynamic Pulsing Text 'AWAITING DATA' */}
                  <div className="flex items-center gap-2.5 my-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <h3 className="text-base sm:text-lg font-mono font-extrabold text-amber-600 dark:text-amber-300/90 tracking-wider animate-pulse">
                      AWAITING DATA
                    </h3>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mt-3 font-medium">
                    <Activity className="w-3.5 h-3.5 text-emerald-500" />
                    {stat.hint}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Main Grid: Left Column & Right Action Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* Left Column (Main Content) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8">
            
            {/* AI TOURIST DEMAND INSIGHT (Masterpiece Card) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50/90 via-indigo-50/70 to-white/90 dark:from-indigo-950/70 dark:via-[#131B38]/80 dark:to-[#0F1426]/90 backdrop-blur-xl border border-blue-400/40 dark:border-indigo-500/40 p-7 sm:p-8 shadow-[0_4px_30px_rgba(59,130,246,0.12)] dark:shadow-[0_0_40px_rgba(99,102,241,0.2)] transition-all duration-500"
            >
              {/* Radial Ambient Glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-400/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                {/* Header with live AI radar indicator */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-500/10 dark:bg-indigo-500/20 border border-blue-400/30 dark:border-indigo-400/40 text-blue-600 dark:text-indigo-300 rounded-2xl shadow-sm">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-blue-600 dark:text-indigo-400 uppercase">AI Predictive Radar</span>
                      <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-gray-900 dark:text-white">
                        AI Tourist Demand Insight
                      </h2>
                    </div>
                  </div>

                  {/* Pulsing Live AI Dot */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-indigo-950/80 border border-blue-200 dark:border-indigo-500/40 text-blue-700 dark:text-indigo-200 text-xs font-semibold shadow-sm backdrop-blur-md">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-80"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <Radio className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
                    Live AI Telemetry
                  </div>
                </div>

                {/* Surge Badge & Main Copy Advising Fayoum & Siwa Oasis */}
                <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-indigo-900/30 border border-blue-200/80 dark:border-indigo-500/25 backdrop-blur-sm shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +148% Search Surge
                    </span>
                    <span className="text-xs text-blue-700 dark:text-indigo-300 font-semibold uppercase tracking-wider">High Velocity Window</span>
                  </div>

                  <p className="text-gray-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed">
                    Unprecedented tourist interest detected for <strong className="text-amber-600 dark:text-amber-400 font-bold">Fayoum & Siwa Oasis</strong> this month. Search volume across verified international explorers has surged by <strong className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">+148%</strong> for desert glamping, eco-lodges, and artisan crafts.
                  </p>
                </div>

                {/* Sub-telemetry Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-blue-200/80 dark:border-white/10 shadow-sm">
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Primary Explorer Inflow</p>
                    <p className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">Europe & GCC Travelers</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-blue-200/80 dark:border-white/10 shadow-sm">
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Peak Booking Horizon</p>
                    <p className="text-xs font-bold text-amber-600 dark:text-amber-300 mt-0.5">Next 7 - 21 Days</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-blue-200/80 dark:border-white/10 shadow-sm">
                    <p className="text-[10px] text-gray-500 dark:text-slate-400 uppercase font-semibold">AI Recommendation</p>
                    <p className="text-xs font-bold text-blue-700 dark:text-indigo-300 mt-0.5">Launch Targeted Incentive</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* YOUR ACTIVE OFFERS Section */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/85 dark:bg-[#111A2E]/70 backdrop-blur-xl border border-gray-200/90 dark:border-white/10 rounded-3xl p-7 sm:p-8 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight flex items-center gap-2.5">
                    <Tag className="w-5 h-5 text-amber-500" />
                    Your Active Offers
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 font-medium mt-1">
                    Manage direct incentives shown to travelers across EgyptX AI
                  </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider">
                  {activeOffersList.length} Active {activeOffersList.length === 1 ? 'Campaign' : 'Campaigns'}
                </span>
              </div>

              {/* Offer Cards List */}
              <div className="flex flex-col gap-4">
                {activeOffersList.map((offer) => (
                  <div 
                    key={offer.id} 
                    className="group relative bg-slate-50/90 dark:bg-[#0D1525]/80 hover:bg-white dark:hover:bg-[#121B2F] border border-gray-200/80 dark:border-white/10 hover:border-amber-500/40 rounded-2xl p-5 transition-all duration-300 shadow-sm hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      
                      <div className="flex items-start sm:items-center gap-4">
                        {/* Percentage / Benefit Badge */}
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 shadow-sm">
                          <Percent className="w-6 h-6" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm">
                              {offer.badge}
                            </span>
                            
                            {/* Active Status Dot Indicator */}
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${
                              offer.status === 'Active' 
                                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                                : 'bg-gray-500/10 text-gray-500 dark:text-slate-400 border border-gray-500/20'
                            }`}>
                              {offer.status === 'Active' && (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                              )}
                              {offer.status}
                            </span>

                            {offer.isGlobalBroadcast && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                <Globe className="w-3 h-3" />
                                Global Broadcast
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-gray-900 dark:text-white text-base sm:text-lg group-hover:text-amber-600 dark:group-hover:text-amber-200 transition-colors">
                            {offer.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-slate-400 mt-0.5 line-clamp-1">{offer.description}</p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500 dark:text-slate-400">
                            {/* Redemption Counter */}
                            <span className="flex items-center gap-1.5 font-medium text-gray-700 dark:text-slate-300">
                              <Users className="w-3.5 h-3.5 text-amber-500" />
                              <strong className="text-gray-900 dark:text-white font-mono">{offer.redemptions}</strong> Redemptions
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Valid: {offer.validUntil}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Glowing MANAGE Button on Hover */}
                      <div className="w-full sm:w-auto flex items-center justify-end">
                        <button 
                          onClick={() => handleToggleStatus(offer.id)}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 hover:border-amber-400/50 text-gray-800 dark:text-slate-200 hover:text-gray-900 dark:hover:text-white text-xs font-extrabold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5 text-amber-500" />
                          <span>{offer.status === 'Active' ? 'Manage' : 'Reactivate'}</span>
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: CREATE NEW OFFER Action Form */}
          <div className="lg:col-span-5 xl:col-span-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="sticky top-28 bg-white/90 dark:bg-[#111A2E]/80 backdrop-blur-xl border border-gray-200/90 dark:border-amber-500/25 rounded-3xl p-6 sm:p-7 shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Decorative Glow */}
              <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-sm">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-amber-300 uppercase tracking-tight">
                    Create New Offer
                  </h3>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400">Target EgyptX verified visitors</p>
                </div>
              </div>

              {formSuccess && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                  Offer published {broadcastGlobally ? 'and broadcasted globally!' : 'successfully!'}
                </div>
              )}

              <form onSubmit={handleLaunchOffer} className="mt-5 space-y-4">
                
                {/* Offer Title */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Offer Title
                  </label>
                  <input 
                    type="text"
                    required
                    value={offerTitle}
                    onChange={(e) => setOfferTitle(e.target.value)}
                    placeholder="e.g. 20% Off Desert Sunset Dinner"
                    className="w-full bg-slate-50/90 dark:bg-[#0A101D]/90 border border-gray-200 dark:border-white/10 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-all"
                  />
                </div>

                {/* Quick Badge Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Discount / Badge Tag
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['15% OFF', '20% OFF', 'VIP PERK'].map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => setBadgeText(b)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                          badgeText === b 
                            ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm' 
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-white/10 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Discount / Benefit Description */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Discount / Benefit Description
                  </label>
                  <textarea 
                    rows={3}
                    value={offerDiscount}
                    onChange={(e) => setOfferDiscount(e.target.value)}
                    placeholder="Describe inclusions, reservations requirements, or minimum stay terms..."
                    className="w-full bg-slate-50/90 dark:bg-[#0A101D]/90 border border-gray-200 dark:border-white/10 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 outline-none transition-all resize-none"
                  />
                </div>

                {/* Valid Until Date Picker */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Valid Until
                  </label>
                  <input 
                    type="date"
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full bg-slate-50/90 dark:bg-[#0A101D]/90 border border-gray-200 dark:border-white/10 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-2 focus:ring-amber-500/20 rounded-xl px-4 py-3 text-xs sm:text-sm text-gray-900 dark:text-white outline-none transition-all"
                  />
                </div>

                {/* GLOBAL OFFERS BROADCAST TOGGLE */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-300/60 dark:border-amber-500/30 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                        <Radio className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-gray-900 dark:text-white block">
                          Broadcast Globally
                        </span>
                        <span className="text-[10px] text-gray-500 dark:text-slate-400 block">
                          Push instantly to all EgyptX tourists
                        </span>
                      </div>
                    </div>

                    {/* Toggle Switch */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={broadcastGlobally}
                      onClick={() => setBroadcastGlobally(!broadcastGlobally)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                        broadcastGlobally ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          broadcastGlobally ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {broadcastGlobally && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-500/20 flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-300 font-medium"
                    >
                      <Globe className="w-3 h-3 text-emerald-500 shrink-0" />
                      Reaches 48,200+ tourists active on EgyptX live map
                    </motion.div>
                  )}
                </div>

                {/* Launch Offer Button with Amber-to-Orange Gradient & Hover Glow */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black uppercase tracking-wider text-xs sm:text-sm shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.55)] hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4 text-slate-950" />
                    Launch Offer
                  </button>
                </div>

                <p className="text-[10px] text-gray-500 dark:text-slate-500 text-center flex items-center justify-center gap-1 mt-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Instant B2B syndication to EgyptX verified visitors
                </p>
              </form>
            </motion.div>
          </div>

        </div>

      </div>
    </div>
  );
}
