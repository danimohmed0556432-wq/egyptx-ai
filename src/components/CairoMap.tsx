'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon paths failing in Next.js/Webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export type CrowdLevel = 'smooth' | 'moderate' | 'crowded';

export interface CairoLandmark {
  id: string;
  name_ar: string;
  name_en: string;
  latitude: number;
  longitude: number;
  visitors: number;
  occupancy: number;
  waitTime: string;
  status: CrowdLevel;
  category?: string;
}

export const DEFAULT_CAIRO_LANDMARKS: CairoLandmark[] = [
  {
    id: 'citadel',
    name_ar: 'قلعة صلاح الدين',
    name_en: 'Citadel of Saladin',
    latitude: 30.0287,
    longitude: 31.26,
    visitors: 410,
    occupancy: 42,
    waitTime: '5 دقائق',
    status: 'smooth',
    category: 'معالم أثرية',
  },
  {
    id: 'khan-el-khalili',
    name_ar: 'خان الخليلي',
    name_en: 'Khan El Khalili',
    latitude: 30.0477,
    longitude: 31.2622,
    visitors: 1840,
    occupancy: 92,
    waitTime: '28 دقيقة',
    status: 'crowded',
    category: 'معالم أثرية',
  },
  {
    id: 'egyptian-museum',
    name_ar: 'المتحف المصري',
    name_en: 'The Egyptian Museum',
    latitude: 30.0478,
    longitude: 31.2336,
    visitors: 760,
    occupancy: 64,
    waitTime: '12 دقيقة',
    status: 'moderate',
    category: 'متاحف',
  },
  {
    id: 'al-muizz',
    name_ar: 'شارع المعز',
    name_en: 'Al-Muizz Street',
    latitude: 30.0504,
    longitude: 31.2616,
    visitors: 690,
    occupancy: 58,
    waitTime: '10 دقائق',
    status: 'moderate',
    category: 'معالم أثرية',
  },
  {
    id: 'cairo-tower',
    name_ar: 'برج القاهرة',
    name_en: 'Cairo Tower',
    latitude: 30.0459,
    longitude: 31.2243,
    visitors: 320,
    occupancy: 39,
    waitTime: '6 دقائق',
    status: 'smooth',
    category: 'معالم حديثة',
  },
  {
    id: 'religions-complex',
    name_ar: 'مجمع الأديان',
    name_en: 'Religions Complex',
    latitude: 30.0061,
    longitude: 31.2304,
    visitors: 285,
    occupancy: 34,
    waitTime: '4 دقائق',
    status: 'smooth',
    category: 'معالم دينية',
  },
];

const CROWD_STYLES: Record<
  CrowdLevel,
  { color: string; label: string; badgeBg: string; badgeText: string; border: string }
> = {
  smooth: {
    color: '#22C55E',
    label: 'انسيابي',
    badgeBg: 'rgba(34, 197, 94, 0.16)',
    badgeText: '#4ADE80',
    border: 'rgba(34, 197, 94, 0.4)',
  },
  moderate: {
    color: '#F59E0B',
    label: 'متوسط',
    badgeBg: 'rgba(245, 158, 11, 0.16)',
    badgeText: '#FBBF24',
    border: 'rgba(245, 158, 11, 0.4)',
  },
  crowded: {
    color: '#EF4444',
    label: 'ذروة وتكدس',
    badgeBg: 'rgba(239, 68, 68, 0.18)',
    badgeText: '#F87171',
    border: 'rgba(239, 68, 68, 0.45)',
  },
};

function createPulsingCrowdIcon(status: CrowdLevel): L.DivIcon {
  const { color } = CROWD_STYLES[status];
  return new L.DivIcon({
    html: `
      <div style="position: relative; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center;">
        <span style="position: absolute; width: 24px; height: 24px; border-radius: 9999px; background: ${color}; opacity: 0.35; animation: cairo-pulse 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></span>
        <span style="position: relative; width: 13px; height: 13px; border-radius: 9999px; background: ${color}; border: 2px solid #080705; box-shadow: 0 0 12px ${color};"></span>
      </div>
    `,
    className: 'custom-crowd-marker bg-transparent border-0',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

function MapUpdater({ selectedId, landmarks }: { selectedId: string | null; landmarks: CairoLandmark[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedId) {
      const target = landmarks.find((a) => a.id === selectedId);
      if (target && target.latitude && target.longitude) {
        map.flyTo([target.latitude, target.longitude], 14, {
          duration: 1.2,
        });
      }
    }
  }, [selectedId, landmarks, map]);

  return null;
}

interface CairoMapProps {
  attractions?: any[];
  selectedId?: string | null;
  onMarkerClick?: (id: string) => void;
}

export default function CairoMap({ attractions = [], selectedId = null, onMarkerClick }: CairoMapProps) {
  const cairoCenter: [number, number] = [30.036, 31.245];

  const mergedLandmarks = useMemo<CairoLandmark[]>(() => {
    const byName = new Map<string, CairoLandmark>();
    for (const lm of DEFAULT_CAIRO_LANDMARKS) {
      byName.set(lm.name_ar, lm);
    }

    for (const a of attractions) {
      if (!a?.latitude || !a?.longitude) continue;
      const nameAr = a.name_ar || a.name || a.name_en || 'معلم سياحي';
      if (byName.has(nameAr)) continue;
      const visitors = typeof a.visitors === 'number' ? a.visitors : (a.checkins || 180) + 120;
      const occupancy = Math.min(95, Math.max(25, Math.round((visitors / 1600) * 100)));
      const status: CrowdLevel = occupancy >= 80 ? 'crowded' : occupancy >= 55 ? 'moderate' : 'smooth';
      byName.set(nameAr, {
        id: String(a.id || nameAr),
        name_ar: nameAr,
        name_en: a.name_en || nameAr,
        latitude: Number(a.latitude),
        longitude: Number(a.longitude),
        visitors,
        occupancy,
        waitTime: occupancy >= 80 ? '20 دقيقة' : occupancy >= 55 ? '10 دقائق' : '5 دقائق',
        status,
        category: a.category,
      });
    }

    return Array.from(byName.values());
  }, [attractions]);

  return (
    <div className="w-full h-full rounded-xl overflow-hidden relative z-0 bg-[#080705]" dir="rtl">
      {/* Top-right Live Map Badge */}
      <div className="absolute top-3 right-3 z-[400] flex items-center gap-2 bg-[#12100C]/90 backdrop-blur-md text-[#F5EFE6] border border-[#D6A044]/35 rounded-lg px-3 py-1.5 text-[11px] font-bold shadow-lg">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>القاهرة الكبرى • بث حي</span>
      </div>

      {/* Crowd Status Legend */}
      <div className="absolute bottom-3 right-3 z-[400] bg-[#12100C]/92 backdrop-blur-md text-[#F5EFE6] border border-[#D6A044]/30 rounded-xl p-2.5 text-[11px] shadow-xl flex flex-col gap-1.5 min-w-[122px]">
        {(['smooth', 'moderate', 'crowded'] as CrowdLevel[]).map((lvl) => (
          <div key={lvl} className="flex items-center justify-between gap-2">
            <span className="text-[#E8E0D0]">{CROWD_STYLES[lvl].label}</span>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{
                backgroundColor: CROWD_STYLES[lvl].color,
                boxShadow: `0 0 8px ${CROWD_STYLES[lvl].color}`,
              }}
            />
          </div>
        ))}
      </div>

      <MapContainer
        center={cairoCenter}
        zoom={12}
        scrollWheelZoom={true}
        className="w-full h-full bg-[#080705] cairo-locked-dark-map"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater selectedId={selectedId} landmarks={mergedLandmarks} />

        {mergedLandmarks.map((lm) => {
          const style = CROWD_STYLES[lm.status];
          return (
            <Marker
              key={lm.id}
              position={[lm.latitude, lm.longitude]}
              icon={createPulsingCrowdIcon(lm.status)}
              eventHandlers={{
                click: () => onMarkerClick && onMarkerClick(lm.id),
              }}
            >
              <Popup className="cairo-popup" closeButton={true}>
                <div
                  className="w-[225px] bg-[#12100C] text-[#F5EFE6] rounded-xl overflow-hidden shadow-2xl border border-[#D6A044]/40 p-3.5"
                  dir="rtl"
                >
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div>
                      <h4 className="font-bold text-[#F4C66A] text-sm leading-snug">
                        {lm.name_ar}
                      </h4>
                      <span className="text-[10px] text-[#C7B9A5] font-mono">
                        {lm.name_en}
                      </span>
                    </div>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap border"
                      style={{
                        backgroundColor: style.badgeBg,
                        color: style.badgeText,
                        borderColor: style.border,
                      }}
                    >
                      {style.label}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs bg-[#080705]/75 rounded-lg p-2.5 border border-[#D6A044]/15">
                    <div className="flex items-center justify-between">
                      <span className="text-[#C7B9A5]">الزوار الحاليون</span>
                      <span className="font-bold text-[#F5EFE6] font-mono">
                        {lm.visitors.toLocaleString('en-US')}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[#C7B9A5]">نسبة الإشغال</span>
                        <span className="font-bold font-mono" style={{ color: style.badgeText }}>
                          {lm.occupancy}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${lm.occupancy}%`,
                            backgroundColor: style.color,
                          }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="text-[#C7B9A5]">متوسط وقت الانتظار</span>
                      <span className="font-semibold text-[#D6A044]">{lm.waitTime}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes cairo-pulse {
          0% { transform: scale(0.8); opacity: 0.7; }
          70%, 100% { transform: scale(1.9); opacity: 0; }
        }
        .cairo-locked-dark-map.leaflet-container {
          background-color: #080705 !important;
        }
        .cairo-locked-dark-map .leaflet-tile-pane {
          filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%) !important;
        }
        .cairo-locked-dark-map .leaflet-marker-pane,
        .cairo-locked-dark-map .leaflet-popup-pane {
          filter: none !important;
        }
        .cairo-locked-dark-map .leaflet-control-attribution {
          background: rgba(8, 7, 5, 0.78) !important;
          color: #C7B9A5 !important;
        }
        .cairo-locked-dark-map .leaflet-control-attribution a {
          color: #D6A044 !important;
        }
        .cairo-popup .leaflet-popup-content-wrapper {
          background-color: transparent;
          border: none;
          box-shadow: none;
          padding: 0;
        }
        .cairo-popup .leaflet-popup-tip {
          background-color: #12100C;
          border: 1px solid rgba(214, 160, 68, 0.35);
        }
        .cairo-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .cairo-popup .leaflet-popup-close-button {
          color: #D6A044 !important;
          top: 6px !important;
          left: 8px !important;
          right: auto !important;
        }
      `,
        }}
      />
    </div>
  );
}
