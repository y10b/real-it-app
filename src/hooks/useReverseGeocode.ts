'use client';

import { useState, useEffect } from 'react';

interface AddressInfo {
  sido: string;
  gugun: string;
  dong: string;
  loaded: boolean;
}

export function useReverseGeocode(lat: number, lng: number, geoLoaded: boolean) {
  const [address, setAddress] = useState<AddressInfo>({
    sido: '',
    gugun: '',
    dong: '',
    loaded: false,
  });

  useEffect(() => {
    if (!geoLoaded || !window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const coord = new window.kakao.maps.LatLng(lat, lng);

      geocoder.coord2RegionCode(
        lng,
        lat,
        (result: any[], status: string) => {
          if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
            const region = result.find((r: any) => r.region_type === 'H') || result[0];
            setAddress({
              sido: region.region_1depth_name || '',
              gugun: region.region_2depth_name || '',
              dong: region.region_3depth_name || '',
              loaded: true,
            });
          } else {
            setAddress((prev) => ({ ...prev, loaded: true }));
          }
        }
      );
    });
  }, [lat, lng, geoLoaded]);

  return address;
}
