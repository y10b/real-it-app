'use client';

import { useState, useEffect } from 'react';

interface GeoState {
  lat: number;
  lng: number;
  loaded: boolean;
  error: string | null;
}

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청

export function useGeolocation() {
  const [geo, setGeo] = useState<GeoState>({
    ...DEFAULT_CENTER,
    loaded: false,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeo((prev) => ({ ...prev, loaded: true, error: '위치 정보를 지원하지 않는 브라우저입니다.' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loaded: true,
          error: null,
        });
      },
      (err) => {
        setGeo((prev) => ({
          ...prev,
          loaded: true,
          error: `위치 정보를 가져올 수 없습니다: ${err.message}`,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return geo;
}
