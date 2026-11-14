'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface CommandMapSite {
  id?: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
  status?: 'optimal' | 'busy' | 'alert';
  crowdDensity?: number;
  activeVisitors?: number;
  readiness?: string;
}

const createStatusIcon = (status: 'optimal' | 'busy' | 'alert' = 'optimal', isSelected = false) => {
  const color =
    status === 'alert' ? '#F59E0B' : status === 'busy' ? '#D6A044' : '#10B981';
  const glow =
    status === 'alert'
      ? 'rgba(245, 158, 11, 0.55)'
      : status === 'busy'
        ? 'rgba(214, 160, 68, 0.6)'
        : 'rgba(16, 185, 129, 0.55)';
  const size = isSelected ? 28 : 22;

  return new L.DivIcon({
    html: `
      <div style="
        background: radial-gradient(circle, ${color} 40%, #080705 100%);
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 2px solid ${isSelected ? '#FFD27A' : '#D6A044'};
        box-shadow: 0 0 ${isSelected ? '18px' : '12px'} ${glow};
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="width: 7px; height: 7px; background-color: #FFF8E7; border-radius: 50%;"></div>
      </div>
    `,
    className: 'egyptx-cmd-pin',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 12, { duration: 0.9 });
  }, [center, map]);
  return null;
}

export default function MapInner({
  data,
  selectedSiteId,
  onSelect,
  labels,
}: {
  data: CommandMapSite[];
  selectedSiteId?: string;
  onSelect: (loc: CommandMapSite) => void;
  labels?: {
    crowd?: string;
    visitors?: string;
    readiness?: string;
  };
}) {
  const selectedSite = data.find((d) => d.id && d.id === selectedSiteId);
  const center: [number, number] = selectedSite
    ? [selectedSite.latitude, selectedSite.longitude]
    : [30.025, 31.205];

  return (
    <MapContainer
      center={center}
      zoom={11}
      style={{ height: '100%', width: '100%', background: '#080705' }}
      zoomControl={false}
      attributionControl={false}
    >
      <MapController center={center} />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
      />

      {data.map((loc, idx) => {
        if (!loc.latitude || !loc.longitude) return null;
        const isSelected = Boolean(selectedSiteId && loc.id === selectedSiteId);
        const icon = createStatusIcon(loc.status || 'optimal', isSelected);

        return (
          <Marker
            key={loc.id || idx}
            position={[loc.latitude, loc.longitude]}
            icon={icon}
            eventHandlers={{
              click: () => onSelect(loc),
            }}
          >
            <Popup>
              <div className="min-w-[180px] text-xs leading-relaxed text-[#080705]">
                <div className="font-bold text-sm text-[#8A661C] mb-1">{loc.name}</div>
                {typeof loc.crowdDensity === 'number' && (
                  <div>
                    <span className="font-semibold">{labels?.crowd || 'Crowd Density'}:</span>{' '}
                    {loc.crowdDensity}%
                  </div>
                )}
                {typeof loc.activeVisitors === 'number' && (
                  <div>
                    <span className="font-semibold">{labels?.visitors || 'Active Visitors'}:</span>{' '}
                    {loc.activeVisitors.toLocaleString()}
                  </div>
                )}
                {loc.readiness && (
                  <div>
                    <span className="font-semibold">{labels?.readiness || 'Readiness'}:</span>{' '}
                    {loc.readiness}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
