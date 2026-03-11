'use client';

import { useEffect, useRef, useCallback } from 'react';
import { StoreInfo, STORE_META } from '@/types';

declare global {
  interface Window {
    kakao: any;
  }
}

interface Props {
  lat: number;
  lng: number;
  stores: StoreInfo[];
  onStoreClick?: (store: StoreInfo) => void;
  focusLocation?: { lat: number; lng: number } | null;
}

export default function KakaoMap({ lat, lng, stores, onStoreClick, focusLocation }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);
  const focusMarkerRef = useRef<any>(null);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    const center = new window.kakao.maps.LatLng(lat, lng);
    const map = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 5,
    });
    mapInstanceRef.current = map;

    const currentMarker = new window.kakao.maps.Marker({
      position: center,
      map,
    });

    const currentOverlay = new window.kakao.maps.CustomOverlay({
      content: `<div style="padding:4px 8px;background:#3B82F6;color:white;border-radius:12px;font-size:12px;font-weight:600;box-shadow:0 2px 8px rgba(0,0,0,0.2);">내 위치</div>`,
      position: center,
      yAnchor: 2.5,
      map,
    });

    overlaysRef.current.push(currentOverlay);
    markersRef.current.push(currentMarker);
  }, [lat, lng]);

  useEffect(() => {
    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
    }
  }, [initMap]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps) return;

    markersRef.current.slice(1).forEach((m) => m.setMap(null));
    overlaysRef.current.slice(1).forEach((o) => o.setMap(null));
    markersRef.current = markersRef.current.slice(0, 1);
    overlaysRef.current = overlaysRef.current.slice(0, 1);

    stores.forEach((store) => {
      const meta = STORE_META[store.type];
      const pos = new window.kakao.maps.LatLng(store.lat, store.lng);

      const markerContent = document.createElement('div');
      markerContent.innerHTML = `
        <div style="
          display:flex;align-items:center;gap:4px;
          padding:4px 10px;
          background:${meta.color};color:white;
          border-radius:16px;font-size:11px;font-weight:600;
          box-shadow:0 2px 8px rgba(0,0,0,0.25);
          cursor:pointer;white-space:nowrap;
        ">
          ${meta.label}
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        content: markerContent,
        position: pos,
        yAnchor: 1.3,
        map,
      });

      markerContent.addEventListener('click', () => {
        onStoreClick?.(store);
      });

      overlaysRef.current.push(overlay);
    });
  }, [stores, onStoreClick]);

  // 포커스 위치로 지도 이동 + 강조 마커
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !window.kakao?.maps || !focusLocation) return;

    // 기존 포커스 마커 제거
    if (focusMarkerRef.current) {
      focusMarkerRef.current.setMap(null);
    }

    const pos = new window.kakao.maps.LatLng(focusLocation.lat, focusLocation.lng);
    map.panTo(pos);
    map.setLevel(3);

    const marker = new window.kakao.maps.CustomOverlay({
      content: `<div style="
        width:20px;height:20px;
        background:#EF4444;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 0 0 4px rgba(239,68,68,0.3), 0 2px 8px rgba(0,0,0,0.3);
        animation: pulse 1.5s ease-in-out infinite;
      "></div>`,
      position: pos,
      yAnchor: 0.5,
      map,
    });

    focusMarkerRef.current = marker;
  }, [focusLocation]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
