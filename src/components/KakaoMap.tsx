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
}

export default function KakaoMap({ lat, lng, stores, onStoreClick }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const overlaysRef = useRef<any[]>([]);

  const initMap = useCallback(() => {
    if (!mapRef.current || !window.kakao?.maps) return;

    const center = new window.kakao.maps.LatLng(lat, lng);
    const map = new window.kakao.maps.Map(mapRef.current, {
      center,
      level: 5,
    });
    mapInstanceRef.current = map;

    // 현재 위치 마커
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

    // 기존 매장 마커 제거 (현재 위치 마커/오버레이는 유지)
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

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
