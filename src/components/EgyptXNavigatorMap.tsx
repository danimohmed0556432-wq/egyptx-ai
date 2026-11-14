'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '@/context/LanguageContext';
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Crosshair,
  Maximize2,
  Navigation,
  Train,
} from 'lucide-react';

export interface LatLngPoint {
  lat: number;
  lng: number;
}

export interface NavigatorStep {
  instruction: string;
  distance: string;
  duration: string;
  travelMode: string;
  startLocation?: LatLngPoint;
  endLocation?: LatLngPoint;
  encodedPolyline?: string;
  transitDetails?: {
    lineName: string;
    lineShortName: string;
    vehicleType: string;
    departureStop: string;
    arrivalStop: string;
    numStops: number;
    headsign: string;
    lineColor?: string;
  };
}

export interface NavigatorModeData {
  available: boolean;
  distance?: string;
  duration?: string;
  encodedPolyline?: string;
  destinationCoords?: LatLngPoint;
  steps?: NavigatorStep[];
  error?: string;
}

interface EgyptXNavigatorMapProps {
  origin: LatLngPoint;
  destination: string;
  selectedMode: 'transit' | 'driving' | 'walking';
  activeModeData?: NavigatorModeData;
  activeStepIdx: number;
  onSelectStep: (idx: number) => void;
}

function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += deltaLng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

function escapeHtml(text: string): string {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getStepCoordinate(step?: NavigatorStep): LatLngPoint | null {
  if (!step) return null;
  if (step.startLocation) return step.startLocation;
  if (step.encodedPolyline) {
    const pts = decodePolyline(step.encodedPolyline);
    if (pts[0]) return { lat: pts[0][0], lng: pts[0][1] };
  }
  return step.endLocation || null;
}

export default function EgyptXNavigatorMap({
  origin,
  destination,
  selectedMode,
  activeModeData,
  activeStepIdx,
  onSelectStep,
}: EgyptXNavigatorMapProps) {
  const { t, locale } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);
  const activeStepMarkerRef = useRef<L.Marker | null>(null);
  const routeBoundsRef = useRef<L.LatLngBounds | null>(null);
  const hasInteractedWithStepsRef = useRef(false);
  const [drawerOpen, setDrawerOpen] = useState(true);

  const steps = useMemo(() => activeModeData?.steps || [], [activeModeData]);

  // Initialize Leaflet map once on the client with Esri World Dark Gray Canvas (zero-key, zero watermark)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [origin.lat, origin.lng],
      zoom: 14,
      zoomControl: true,
      attributionControl: false,
    });

    // Base Layer: Esri World Dark Gray Base
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16 }
    ).addTo(map);

    // Labels Layer: Esri World Dark Gray Reference
    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
      { maxZoom: 16 }
    ).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;
    routeLayerRef.current = layerGroup;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      routeLayerRef.current = null;
      activeStepMarkerRef.current = null;
      routeBoundsRef.current = null;
    };
  }, []);

  // Draw route polylines and milestone markers only (Origin, Transit BOARD/EXIT, Destination)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = routeLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    if (activeStepMarkerRef.current) {
      activeStepMarkerRef.current.remove();
      activeStepMarkerRef.current = null;
    }
    hasInteractedWithStepsRef.current = false;

    const boundsPoints: [number, number][] = [[origin.lat, origin.lng]];

    if (activeModeData?.available) {
      let overallPoints: [number, number][] = [];
      if (activeModeData.encodedPolyline) {
        overallPoints = decodePolyline(activeModeData.encodedPolyline);
      } else {
        for (const s of steps) {
          if (s.encodedPolyline) {
            overallPoints.push(...decodePolyline(s.encodedPolyline));
          } else {
            if (s.startLocation) overallPoints.push([s.startLocation.lat, s.startLocation.lng]);
            if (s.endLocation) overallPoints.push([s.endLocation.lat, s.endLocation.lng]);
          }
        }
      }

      if (overallPoints.length >= 2) {
        boundsPoints.push(...overallPoints);

        // Dark bronze outer glow
        L.polyline(overallPoints, {
          color: '#76501F',
          weight: 10,
          opacity: 0.55,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layer);

        // Glowing Pharaonic Gold route
        L.polyline(overallPoints, {
          color: '#FFD27A',
          weight: 5,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round',
        }).addTo(layer);
      }

      // Highlight Metro / Transit segments in Royal Turquoise/Cyan + BOARD/EXIT pills
      steps.forEach((step) => {
        const isTransit = step.travelMode === 'TRANSIT';
        if (!isTransit) return;

        let segPoints: [number, number][] = [];
        if (step.encodedPolyline) {
          segPoints = decodePolyline(step.encodedPolyline);
        } else if (step.startLocation && step.endLocation) {
          segPoints = [
            [step.startLocation.lat, step.startLocation.lng],
            [step.endLocation.lat, step.endLocation.lng],
          ];
        }

        if (segPoints.length >= 2) {
          L.polyline(segPoints, {
            color: '#0C4A6E',
            weight: 9,
            opacity: 0.45,
            lineCap: 'round',
          }).addTo(layer);

          L.polyline(segPoints, {
            color: '#38BDF8',
            weight: 6,
            opacity: 0.98,
            dashArray: '10, 6',
            lineCap: 'round',
          }).addTo(layer);
        }

        const td = step.transitDetails;
        if (td) {
          if (step.startLocation && td.departureStop) {
            const boardIcon = L.divIcon({
              className: 'egyptx-station-badge',
              html: `<div style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:9999px;background:#17100A;border:1.5px solid #38BDF8;color:#38BDF8;font-size:10px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,0.65);">${escapeHtml(t('navigator.boardBadge'))}: ${escapeHtml(
                td.departureStop
              )}</div>`,
              iconSize: [150, 22],
              iconAnchor: [75, 28],
            });
            L.marker([step.startLocation.lat, step.startLocation.lng], {
              icon: boardIcon,
              zIndexOffset: 500,
            })
              .bindPopup(
                `<div class="egyptx-popup-inner"><div class="egyptx-popup-badge">${escapeHtml(t('navigator.boardTransitPopup'))}</div><div class="egyptx-popup-text">${escapeHtml(
                  `${td.lineName || t('navigator.metroLineFallback')} (${td.departureStop}${td.headsign ? ` ${t('navigator.towards')} ${td.headsign}` : ''})`
                )}</div></div>`,
                { className: 'egyptx-dark-popup', closeButton: false }
              )
              .addTo(layer);
          }

          if (step.endLocation && td.arrivalStop) {
            const exitIcon = L.divIcon({
              className: 'egyptx-station-badge',
              html: `<div style="display:inline-flex;align-items:center;padding:3px 8px;border-radius:9999px;background:#17100A;border:1.5px solid #38BDF8;color:#F4C66A;font-size:10px;font-weight:800;white-space:nowrap;box-shadow:0 4px 14px rgba(0,0,0,0.65);">${escapeHtml(t('navigator.exitBadge'))}: ${escapeHtml(
                td.arrivalStop
              )}</div>`,
              iconSize: [150, 22],
              iconAnchor: [75, -6],
            });
            L.marker([step.endLocation.lat, step.endLocation.lng], {
              icon: exitIcon,
              zIndexOffset: 500,
            })
              .bindPopup(
                `<div class="egyptx-popup-inner"><div class="egyptx-popup-badge">${escapeHtml(t('navigator.exitStationPopup'))}</div><div class="egyptx-popup-text">${escapeHtml(
                  `${td.arrivalStop} (${td.numStops} ${td.numStops === 1 ? t('navigator.stop') : t('navigator.stops')})`
                )}</div></div>`,
                { className: 'egyptx-dark-popup', closeButton: false }
              )
              .addTo(layer);
          }
        }
      });
    }

    // Origin (START) pulsing gold/emerald beacon dot
    const originIcon = L.divIcon({
      className: 'egyptx-origin-marker',
      html: `<div style="position:relative;display:flex;flex-direction:column;align-items:center;">
        <div class="egyptx-radar-pulse"></div>
        <div style="width:15px;height:15px;border-radius:9999px;background:#10B981;border:2.5px solid #FFD27A;box-shadow:0 0 12px #10B981;position:relative;z-index:2;"></div>
        <div style="margin-top:4px;padding:2px 7px;border-radius:9999px;background:#17100A;border:1px solid #D6A044;color:#F5F0E8;font-size:9px;font-weight:800;letter-spacing:0.06em;white-space:nowrap;">${escapeHtml(t('navigator.startBadge'))}</div>
      </div>`,
      iconSize: [70, 40],
      iconAnchor: [35, 8],
    });
    L.marker([origin.lat, origin.lng], { icon: originIcon, zIndexOffset: 700 }).addTo(layer);

    // Destination Pharaonic Gold pin
    const destCoords =
      activeModeData?.destinationCoords ||
      (boundsPoints.length > 1
        ? { lat: boundsPoints[boundsPoints.length - 1][0], lng: boundsPoints[boundsPoints.length - 1][1] }
        : null);

    if (destCoords) {
      boundsPoints.push([destCoords.lat, destCoords.lng]);
      const destIcon = L.divIcon({
        className: 'egyptx-dest-marker',
        html: `<div style="display:flex;flex-direction:column;align-items:center;">
          <svg width="28" height="34" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 0 8px rgba(255,210,122,0.8));">
            <path d="M12 0C5.373 0 0 5.373 0 12C0 20.25 12 30 12 30C12 30 24 20.25 24 12C24 5.373 18.627 0 12 0Z" fill="#D6A044"/>
            <circle cx="12" cy="11.5" r="4.5" fill="#080705" stroke="#FFD27A" stroke-width="1.5"/>
          </svg>
          <div style="margin-top:2px;padding:2px 8px;border-radius:9999px;background:#17100A;border:1px solid #FFD27A;color:#FFD27A;font-size:9px;font-weight:800;letter-spacing:0.05em;white-space:nowrap;max-width:170px;overflow:hidden;text-overflow:ellipsis;box-shadow:0 4px 12px rgba(0,0,0,0.7);">${escapeHtml(
            destination
          )}</div>
        </div>`,
        iconSize: [160, 54],
        iconAnchor: [80, 34],
      });
      L.marker([destCoords.lat, destCoords.lng], { icon: destIcon, zIndexOffset: 750 }).addTo(layer);
    }

    if (boundsPoints.length >= 2) {
      const routeBounds = L.latLngBounds(boundsPoints);
      routeBoundsRef.current = routeBounds;
      map.fitBounds(routeBounds, { padding: [60, 60], maxZoom: 16, animate: true });
    } else {
      routeBoundsRef.current = null;
      map.setView([origin.lat, origin.lng], 14);
    }
  }, [origin.lat, origin.lng, destination, selectedMode, activeModeData, steps, locale]);

  // Single smooth pulsing gold halo ring (activeStepMarker) that glides to the active coordinate
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || steps.length === 0) return;

    const step = steps[activeStepIdx];
    const coord = getStepCoordinate(step);
    if (!coord) return;

    const haloIcon = L.divIcon({
      className: 'egyptx-active-halo-wrapper',
      html: `<div class="egyptx-active-halo"><div class="egyptx-active-halo-core"></div></div>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
    });

    const stepSummary =
      step.travelMode === 'TRANSIT' && step.transitDetails
        ? `${step.transitDetails.lineName || 'Metro'}: ${step.transitDetails.departureStop} -> ${step.transitDetails.arrivalStop}`
        : step.instruction;

    if (!activeStepMarkerRef.current) {
      activeStepMarkerRef.current = L.marker([coord.lat, coord.lng], {
        icon: haloIcon,
        zIndexOffset: 650,
      }).addTo(map);
    } else {
      activeStepMarkerRef.current.setLatLng([coord.lat, coord.lng]);
    }

    const stepLabel = t('navigator.stepOf')
      .replace('{current}', String(activeStepIdx + 1))
      .replace('{total}', String(steps.length));

    activeStepMarkerRef.current.bindPopup(
      `<div class="egyptx-popup-inner">
        <div class="egyptx-popup-badge">${escapeHtml(stepLabel)}${step.duration ? ` - ${escapeHtml(step.duration)}` : ''}</div>
        <div class="egyptx-popup-text">${escapeHtml(stepSummary)}</div>
      </div>`,
      { className: 'egyptx-dark-popup', closeButton: false }
    );

    if (hasInteractedWithStepsRef.current || activeStepIdx > 0) {
      map.flyTo([coord.lat, coord.lng], 16, { duration: 0.9, easeLinearity: 0.25 });
      setTimeout(() => {
        activeStepMarkerRef.current?.openPopup();
      }, 450);
    }
  }, [activeStepIdx, steps]);

  const handleStepSelect = (idx: number) => {
    hasInteractedWithStepsRef.current = true;
    onSelectStep(idx);
  };

  const handleCenterOnMe = () => {
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([origin.lat, origin.lng], 16, { duration: 0.9, easeLinearity: 0.25 });
    }
  };

  const handleFullRoute = () => {
    const map = mapInstanceRef.current;
    if (map && routeBoundsRef.current) {
      map.fitBounds(routeBoundsRef.current, { padding: [60, 60], maxZoom: 16, animate: true });
    }
  };

  const currentStep = steps[activeStepIdx];
  const isCurrentTransit = currentStep?.travelMode === 'TRANSIT';

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#76501F] bg-[#080705] shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
      <style>{`
        .egyptx-leaflet-map .leaflet-tile-pane {
          filter: sepia(22%) hue-rotate(350deg) brightness(95%) contrast(108%);
        }
        .egyptx-leaflet-map .leaflet-control-attribution {
          display: none !important;
        }
        .egyptx-leaflet-map .leaflet-control-zoom a {
          background-color: #21170D !important;
          color: #F4C66A !important;
          border-color: #D6A044 !important;
        }
        .egyptx-leaflet-map .leaflet-control-zoom a:hover {
          background-color: #17100A !important;
          color: #FFD27A !important;
        }
        .egyptx-dark-popup .leaflet-popup-content-wrapper {
          background: #17100A;
          color: #F5F0E8;
          border: 1px solid #D6A044;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.75);
        }
        .egyptx-dark-popup .leaflet-popup-tip {
          background: #17100A;
          border: 1px solid #D6A044;
        }
        .egyptx-popup-badge {
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 0.08em;
          color: #F4C66A;
          margin-bottom: 3px;
        }
        .egyptx-popup-text {
          font-size: 12px;
          line-height: 1.4;
          color: #F5F0E8;
        }
        .egyptx-radar-pulse {
          position: absolute;
          top: -6px;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.35);
          animation: egyptxRadar 2s ease-out infinite;
        }
        .egyptx-active-halo {
          width: 34px;
          height: 34px;
          border-radius: 9999px;
          background: rgba(255, 210, 122, 0.22);
          border: 2px solid #FFD27A;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 18px rgba(255, 210, 122, 0.65);
          animation: egyptxHaloPulse 1.8s ease-in-out infinite;
        }
        .egyptx-active-halo-core {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          background: #FFD27A;
        }
        @keyframes egyptxRadar {
          0% { transform: scale(0.7); opacity: 0.9; }
          100% { transform: scale(2.1); opacity: 0; }
        }
        @keyframes egyptxHaloPulse {
          0%, 100% { transform: scale(0.92); opacity: 0.85; }
          50% { transform: scale(1.12); opacity: 1; }
        }
      `}</style>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        className="egyptx-leaflet-map w-full h-[440px] sm:h-[500px] z-0"
      />

      {/* Top-right floating controls: FULL ROUTE + CENTER ON ME */}
      <div className="absolute top-3 right-3 z-[400] flex flex-col items-end gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleFullRoute}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#17100A]/90 backdrop-blur-md hover:bg-[#21170D] text-[#F5F0E8] hover:text-[#FFD27A] border border-[#76501F] hover:border-[#D6A044] text-xs font-bold tracking-wider uppercase shadow-lg transition-all"
          >
            <Maximize2 className="w-3.5 h-3.5 text-[#D6A044]" />
            <span>{t('navigator.fullRoute')}</span>
          </button>

          <button
            type="button"
            onClick={handleCenterOnMe}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#21170D]/95 backdrop-blur-md hover:bg-[#17100A] text-[#F4C66A] hover:text-[#FFD27A] border border-[#D6A044] text-xs font-bold tracking-wider uppercase shadow-lg transition-all"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{t('navigator.centerOnMe')}</span>
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#17100A]/85 backdrop-blur-md border border-[#76501F] text-[10px] font-semibold text-[#C7B9A5]">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-[#FFD27A]" />
            <span>{t('navigator.routeWalkLegend')}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-[#38BDF8]" />
            <span>{t('navigator.metroLegend')}</span>
          </span>
        </div>
      </div>

      {/* Collapsible Glassmorphism Bottom Step Navigator Bar */}
      {steps.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 z-[400]">
          <div className="bg-[#17100A]/90 backdrop-blur-md border border-[#76501F] rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#76501F]/40">
              <button
                type="button"
                onClick={() => setDrawerOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4C66A]"
              >
                {drawerOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
                <span>
                  {t('navigator.stepOf')
                    .replace('{current}', String(activeStepIdx + 1))
                    .replace('{total}', String(steps.length))}
                </span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleStepSelect(Math.max(0, activeStepIdx - 1))}
                  disabled={activeStepIdx <= 0}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#21170D] hover:bg-[#76501F]/45 disabled:opacity-40 text-[#F5F0E8] border border-[#76501F] text-xs font-bold transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>{t('navigator.prevStep')}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleStepSelect(Math.min(steps.length - 1, activeStepIdx + 1))
                  }
                  disabled={activeStepIdx >= steps.length - 1}
                  className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-[#D6A044] hover:bg-[#FFD27A] disabled:opacity-40 text-[#080705] text-xs font-extrabold transition-colors"
                >
                  <span>{t('navigator.nextStep')}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {drawerOpen && currentStep && (
              <div className="px-3.5 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      isCurrentTransit
                        ? 'bg-[#38BDF8]/15 border-[#38BDF8]/50 text-[#38BDF8]'
                        : 'bg-[#D6A044]/15 border-[#D6A044]/50 text-[#F4C66A]'
                    }`}
                  >
                    {isCurrentTransit ? (
                      <Train className="w-4 h-4" />
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-[#F5F0E8] font-medium leading-snug line-clamp-2">
                    {isCurrentTransit && currentStep.transitDetails
                      ? `${currentStep.transitDetails.lineName || t('navigator.metroLineFallback')}: ${t('navigator.boardBadge')} ${currentStep.transitDetails.departureStop} -> ${t('navigator.exitBadge')} ${currentStep.transitDetails.arrivalStop} (${currentStep.transitDetails.numStops} ${currentStep.transitDetails.numStops === 1 ? t('navigator.stop') : t('navigator.stops')})`
                      : currentStep.instruction}
                  </p>
                </div>
                {(currentStep.distance || currentStep.duration) && (
                  <span className="shrink-0 text-[11px] font-mono text-[#F4C66A] bg-[#21170D] border border-[#76501F] px-2.5 py-1 rounded-lg">
                    {currentStep.distance} {currentStep.duration ? `(${currentStep.duration})` : ''}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
