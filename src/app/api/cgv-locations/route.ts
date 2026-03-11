import { NextRequest, NextResponse } from 'next/server';

const KAKAO_REST_KEY = process.env.KAKAO_REST_API_KEY;

export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat') || '37.5665';
  const lng = req.nextUrl.searchParams.get('lng') || '126.978';

  // CGV 극장 목록 가져오기
  const cgvRes = await fetch('https://mcp.aka.page/api/cgv/theaters');
  const cgvData = await cgvRes.json();
  const theaters = cgvData?.data?.theaters || [];

  if (!KAKAO_REST_KEY || theaters.length === 0) {
    return NextResponse.json({ theaters: [] });
  }

  // 카카오 키워드 검색으로 좌표 찾기 (최대 10개만 - API 호출 절약)
  const userLat = Number(lat);
  const userLng = Number(lng);
  const results: Array<{
    theaterCode: string;
    theaterName: string;
    address: string;
    lat: number;
    lng: number;
    distance: string;
  }> = [];

  const searches = theaters.slice(0, 15).map(async (t: any) => {
    try {
      const query = `CGV ${t.theaterName}`;
      const res = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}&x=${lng}&y=${lat}&sort=accuracy&size=1`,
        { headers: { Authorization: `KakaoAK ${KAKAO_REST_KEY}` } }
      );
      const data = await res.json();
      const place = data?.documents?.[0];
      if (place) {
        const placeLat = Number(place.y);
        const placeLng = Number(place.x);
        const dist = getDistance(userLat, userLng, placeLat, placeLng);
        results.push({
          theaterCode: t.theaterCode,
          theaterName: `CGV ${t.theaterName}`,
          address: place.road_address_name || place.address_name || '',
          lat: placeLat,
          lng: placeLng,
          distance: dist.toFixed(1),
        });
      }
    } catch {
      // skip
    }
  });

  await Promise.all(searches);

  // 거리순 정렬 후 가까운 10개만 반환
  results.sort((a, b) => Number(a.distance) - Number(b.distance));

  return NextResponse.json({ theaters: results.slice(0, 10) });
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
