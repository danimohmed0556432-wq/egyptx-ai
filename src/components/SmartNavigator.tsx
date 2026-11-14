'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import {
  Navigation,
  MapPin,
  Train,
  Car,
  Footprints,
  Clock,
  Search,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  LocateFixed,
  Loader2,
  Compass,
  Building,
  Map as MapIcon,
  List
} from 'lucide-react';

function MapLoadingFallback() {
  const { t } = useLanguage();
  return (
    <div className="h-[430px] sm:h-[490px] rounded-2xl bg-[#17100A] border border-[#76501F] flex items-center justify-center text-xs font-semibold text-[#C7B9A5]">
      {t('navigator.loadingMap')}
    </div>
  );
}

const EgyptXNavigatorMap = dynamic(() => import('./EgyptXNavigatorMap'), {
  ssr: false,
  loading: () => <MapLoadingFallback />,
});

interface TransitDetails {
  lineName: string;
  lineShortName: string;
  vehicleType: string;
  departureStop: string;
  arrivalStop: string;
  numStops: number;
  headsign: string;
  lineColor?: string;
}

interface LatLngPoint {
  lat: number;
  lng: number;
}

interface TransitStep {
  instruction: string;
  distance: string;
  duration: string;
  travelMode: string;
  startLocation?: LatLngPoint;
  endLocation?: LatLngPoint;
  encodedPolyline?: string;
  transitDetails?: TransitDetails;
}

interface ModeRouteResult {
  available: boolean;
  distance?: string;
  duration?: string;
  durationValue?: number;
  summary?: string;
  departureTime?: string;
  arrivalTime?: string;
  encodedPolyline?: string;
  destinationCoords?: LatLngPoint;
  steps?: TransitStep[];
  error?: string;
}

interface NavigationResponse {
  success: boolean;
  origin: { lat: number; lng: number };
  destination: string;
  modes: {
    transit: ModeRouteResult;
    driving: ModeRouteResult;
    walking: ModeRouteResult;
  };
  googleMapsUrl: string;
}

const QUICK_HOTELS = [
  'The Nile Ritz-Carlton, Cairo',
  'Marriott Mena House, Giza',
  'Sofitel Cairo Nile El Gezirah',
  'Four Seasons Hotel Cairo at Nile Plaza',
  'Steigenberger Hotel El Tahrir'
];

export default function SmartNavigator() {
  const { t, locale } = useLanguage();
  // Geolocation state
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Search state
  const [destination, setDestination] = useState('');
  const [selectedMode, setSelectedMode] = useState<'transit' | 'driving' | 'walking'>('transit');
  const [viewMode, setViewMode] = useState<'map' | 'text'>('map');
  const [activeStepIdx, setActiveStepIdx] = useState(0);

  // API query state
  const [isSearching, setIsSearching] = useState(false);
  const [navData, setNavData] = useState<NavigationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setActiveStepIdx(0);
  }, [selectedMode, navData]);

  // Detect current GPS position
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setGeoError(t('navigator.geoUnsupported'));
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setGeoLoading(false);
      },
      (err) => {
        setGeoLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError(t('navigator.geoDenied'));
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError(t('navigator.geoUnavailable'));
            break;
          case err.TIMEOUT:
            setGeoError(t('navigator.geoTimeout'));
            break;
          default:
            setGeoError(t('navigator.geoUnknown'));
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 0
      }
    );
  };

  // Auto-detect on mount
  useEffect(() => {
    detectLocation();
  }, []);

  // Handle route submission
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!destination.trim()) return;

    if (!coords) {
      setErrorMsg(t('navigator.gpsRequired'));
      return;
    }

    setIsSearching(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/navigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: coords,
          destination: destination.trim(),
          language: locale || 'en'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('navigator.fetchFailed'));
      }

      setNavData(data);
    } catch (err: any) {
      setErrorMsg(err.message || t('navigator.serviceError'));
    } finally {
      setIsSearching(false);
    }
  };

  // Build direct navigation URL with active mode
  const getActiveGoogleMapsUrl = () => {
    if (!coords || !destination.trim()) return '#';
    const modeParam = selectedMode === 'driving' ? 'driving' : selectedMode === 'walking' ? 'walking' : 'transit';
    return `https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${encodeURIComponent(destination.trim())}&travelmode=${modeParam}`;
  };

  const activeModeData = navData?.modes[selectedMode];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#8A661C] dark:text-[#D4AF37] text-xs font-bold uppercase tracking-widest mb-3 shadow-[0_0_20px_rgba(212,175,55,0.15)]">
          <Compass className="w-4 h-4 text-[#D4AF37] animate-spin" style={{ animationDuration: '10s' }} />
          <span>{t('navigator.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-2">
          {t('navigator.title')}
        </h1>
        <p className="text-gray-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
          {t('navigator.subtitle')}
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white dark:bg-[#0B0F19] border border-gray-200 dark:border-[#D4AF37]/30 rounded-3xl p-6 sm:p-8 shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.85)] relative overflow-hidden backdrop-blur-xl transition-colors duration-200">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#1B6B93]/5 dark:bg-[#1B6B93]/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-10 left-0 w-80 h-80 bg-[#D4AF37]/5 dark:bg-[#D4AF37]/10 rounded-full blur-[100px] pointer-events-none" />

        {/* 1. Geolocation Status Bar */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-gray-50 dark:bg-[#131A2A] border border-gray-200 dark:border-white/5 mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${coords ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'}`}>
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-gray-500 dark:text-slate-400">{t('navigator.currentPosition')}</p>
              {geoLoading ? (
                <p className="text-xs text-amber-600 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  {t('navigator.acquiringGps')}
                </p>
              ) : coords ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">
                  {coords.lat.toFixed(5)}° N, {coords.lng.toFixed(5)}° E ({t('navigator.gpsVerified')})
                </p>
              ) : (
                <p className="text-xs text-rose-500 dark:text-rose-400 font-medium">
                  {geoError || t('navigator.gpsNotDetected')}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={detectLocation}
            disabled={geoLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shadow-sm dark:shadow-none"
          >
            <LocateFixed className={`w-3.5 h-3.5 text-[#D4AF37] ${geoLoading ? 'animate-spin' : ''}`} />
            <span>{coords ? t('navigator.refreshGps') : t('navigator.enableGps')}</span>
          </button>
        </div>

        {/* 2. Search Form */}
        <form onSubmit={handleSearch} className="relative z-10 space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8A661C] dark:text-[#E2CB85] mb-2 font-mono">
              {t('navigator.destLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 dark:text-slate-400">
                <Search className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={t('navigator.destPlaceholder')}
                className="w-full pl-11 pr-32 py-3.5 rounded-2xl bg-gray-50 dark:bg-[#131A2A] border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all shadow-inner"
              />
              <button
                type="submit"
                disabled={isSearching || !destination.trim()}
                className="absolute right-2 top-2 bottom-2 px-5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#C5A059] text-stone-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('navigator.routing')}</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-3.5 h-3.5" />
                    <span>{t('navigator.findRoute')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Hotel Recommendation Pills */}
          <div>
            <p className="text-[11px] font-mono uppercase text-gray-500 dark:text-slate-400 mb-2 flex items-center gap-1">
              <Building className="w-3 h-3 text-[#D4AF37]" />
              <span>{t('navigator.popularHotels')}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {QUICK_HOTELS.map((hotel) => (
                <button
                  key={hotel}
                  type="button"
                  onClick={() => {
                    setDestination(hotel);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors border ${
                    destination === hotel
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-yellow-800 dark:text-[#F5E6B8]'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {hotel}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Error notification banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs mb-6 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 dark:text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">{errorMsg}</p>
              {coords && (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${coords.lat},${coords.lng}&destination=${encodeURIComponent(destination)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300 hover:underline pt-1 font-bold"
                >
                  {t('navigator.openGoogleMaps')} <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* 3. Navigation Results Section */}
        {navData && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 pt-4 border-t border-gray-200 dark:border-white/10"
          >
            {/* Resolved Destination Title */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A661C] dark:text-[#D4AF37] block mb-0.5 font-bold">
                  {t('navigator.routeCalculated')}
                </span>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-rose-500 shrink-0" />
                  <span>{navData.destination}</span>
                </h3>
              </div>

              {/* Direct Primary Action: Navigate with Google Maps */}
              <a
                href={getActiveGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E2CB85] text-stone-950 font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
              >
                <Navigation className="w-4 h-4 fill-stone-950" />
                <span>{t('navigator.navigateGoogleMaps')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Travel Mode Selector Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Transit (Metro / Bus) Card */}
              <button
                type="button"
                onClick={() => setSelectedMode('transit')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedMode === 'transit'
                    ? 'bg-amber-500/10 dark:bg-[#15233C] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                    : 'bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                      <Train className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">{t('navigator.metroTransit')}</span>
                  </div>
                  {selectedMode === 'transit' && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                </div>
                {navData.modes.transit.available ? (
                  <div>
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">{navData.modes.transit.duration}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">{navData.modes.transit.distance}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-slate-500 italic">{t('navigator.noMetroFound')}</p>
                )}
              </button>

              {/* Driving (Taxi / Uber) Card */}
              <button
                type="button"
                onClick={() => setSelectedMode('driving')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedMode === 'driving'
                    ? 'bg-amber-500/10 dark:bg-[#15233C] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                    : 'bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                      <Car className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">{t('navigator.taxiCar')}</span>
                  </div>
                  {selectedMode === 'driving' && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                </div>
                {navData.modes.driving.available ? (
                  <div>
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">{navData.modes.driving.duration}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">{navData.modes.driving.distance}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-slate-500 italic">{t('navigator.drivingUnavailable')}</p>
                )}
              </button>

              {/* Walking Card */}
              <button
                type="button"
                onClick={() => setSelectedMode('walking')}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  selectedMode === 'walking'
                    ? 'bg-amber-500/10 dark:bg-[#15233C] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                    : 'bg-gray-50 dark:bg-[#131A2A] border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                      <Footprints className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">{t('navigator.walking')}</span>
                  </div>
                  {selectedMode === 'walking' && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                </div>
                {navData.modes.walking.available ? (
                  <div>
                    <p className="text-xl font-extrabold text-gray-900 dark:text-white">{navData.modes.walking.duration}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-medium">{navData.modes.walking.distance}</p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 dark:text-slate-500 italic">{t('navigator.tooFarToWalk')}</p>
                )}
              </button>
            </div>

            {/* View Mode Toggle: Interactive Map vs. Step-by-Step Text */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex p-1 rounded-xl bg-gray-100 dark:bg-[#17100A] border border-gray-200 dark:border-[#76501F]">
                <button
                  type="button"
                  onClick={() => setViewMode('map')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    viewMode === 'map'
                      ? 'bg-[#D6A044] text-[#080705] shadow-[0_0_16px_rgba(214,160,68,0.35)]'
                      : 'text-gray-600 dark:text-[#C7B9A5] hover:text-gray-900 dark:hover:text-[#F4C66A]'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>{t('navigator.interactiveMap')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('text')}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                    viewMode === 'text'
                      ? 'bg-[#D6A044] text-[#080705] shadow-[0_0_16px_rgba(214,160,68,0.35)]'
                      : 'text-gray-600 dark:text-[#C7B9A5] hover:text-gray-900 dark:hover:text-[#F4C66A]'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>{t('navigator.stepByStepText')}</span>
                </button>
              </div>
            </div>

            {viewMode === 'map' && (
              <EgyptXNavigatorMap
                origin={navData.origin}
                destination={navData.destination}
                selectedMode={selectedMode}
                activeModeData={activeModeData}
                activeStepIdx={activeStepIdx}
                onSelectStep={setActiveStepIdx}
              />
            )}

            {/* Step-by-Step Transit Instructions */}
            {viewMode === 'text' && (
            <div className="p-5 rounded-2xl bg-gray-50 dark:bg-[#131A2A] border border-gray-200 dark:border-white/5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                    {selectedMode === 'transit' ? t('navigator.metroTransitRoute') : selectedMode === 'driving' ? t('navigator.drivingDirections') : t('navigator.walkingRoute')}
                  </span>
                </div>
                {activeModeData?.departureTime && activeModeData?.arrivalTime && (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    {t('navigator.depart')} {activeModeData.departureTime} · {t('navigator.arrive')} {activeModeData.arrivalTime}
                  </span>
                )}
              </div>

              {activeModeData?.steps && activeModeData.steps.length > 0 ? (
                <div className="space-y-3">
                  {activeModeData.steps.map((step, idx) => {
                    const isTransit = step.travelMode === 'TRANSIT';
                    const td = step.transitDetails;

                    return (
                      <div key={idx} onClick={() => { setActiveStepIdx(idx); setViewMode('map'); }} className={`flex items-start gap-3 text-xs cursor-pointer rounded-xl p-2 -mx-2 transition-colors ${activeStepIdx === idx ? 'bg-[#D6A044]/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
                        <div className="shrink-0 w-6 h-6 rounded-full bg-gray-200 dark:bg-white/10 text-gray-800 dark:text-white font-mono flex items-center justify-center text-[10px] font-bold mt-0.5">
                          {idx + 1}
                        </div>

                        <div className="flex-1 space-y-1">
                          {isTransit && td ? (
                            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 space-y-2">
                              <div className="flex items-center gap-2">
                                <Train className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                                <span className="font-bold text-blue-900 dark:text-blue-300 text-sm">
                                  {td.lineName || td.lineShortName || t('navigator.metroLineFallback')} {td.headsign ? `${t('navigator.towards')} ${td.headsign}` : ''}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-700 dark:text-slate-300">
                                <div>
                                  <span className="text-gray-500 dark:text-slate-400 block font-mono text-[10px]">{t('navigator.boardAt')}</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{td.departureStop}</span>
                                </div>
                                <div>
                                  <span className="text-gray-500 dark:text-slate-400 block font-mono text-[10px]">{t('navigator.getOffAt')}</span>
                                  <span className="font-semibold text-gray-900 dark:text-white">{td.arrivalStop} ({td.numStops} {td.numStops === 1 ? t('navigator.stop') : t('navigator.stops')})</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-gray-800 dark:text-slate-300">
                              <p className="leading-relaxed font-medium">{step.instruction}</p>
                              {step.distance && (
                                <span className="text-[10px] font-mono text-gray-500 dark:text-slate-400 shrink-0 ml-2">
                                  {step.distance} ({step.duration})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500 dark:text-slate-400 italic">
                  {activeModeData?.error || t('navigator.stepsUnavailable')}
                </p>
              )}
            </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
