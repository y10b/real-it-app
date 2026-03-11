import { NextRequest, NextResponse } from 'next/server';

const KAKAO_REST_KEY = process.env.KAKAO_REST_API_KEY;

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat') || '37.5665';
  const lng = req.nextUrl.searchParams.get('lng') || '126.978';

  if (!KAKAO_REST_KEY) {
    return NextResponse.json({ theaters: [], error: 'KAKAO_REST_API_KEY not set' });
  }

  // 카카오 키워드 검색으로 주변 CGV를 직접 검색 (가장 정확)
  const userLat = Number(lat);
  const userLng = Number(lng);

  try {
    const res = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?query=CGV&x=${lng}&y=${lat}&radius=20000&sort=distance&size=15&category_group_code=CT1`,
      { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
    );
    const data = await res.json();
    const places = data?.documents || [];

    const theaters = places
      .filter((p: any) => p.place_name?.includes('CGV'))
      .map((p: any) => {
        const placeLat = Number(p.y);
        const placeLng = Number(p.x);
        const dist = getDistance(userLat, userLng, placeLat, placeLng);

        // CGV 극장 코드 추출 시도 (place_name에서)
        const name = p.place_name || '';
        const theaterName = name.replace(/^CGV\s*/, '');

        return {
          theaterCode: p.id || '',
          theaterName: name,
          address: p.road_address_name || p.address_name || '',
          lat: placeLat,
          lng: placeLng,
          distance: dist.toFixed(1),
          phone: p.phone || '',
        };
      });

    return NextResponse.json({ theaters });
  } catch {
    return NextResponse.json({ theaters: [], error: 'search failed' });
  }
}

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
