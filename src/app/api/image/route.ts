import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_HOSTS = ['img.daisomall.co.kr', 'image.oliveyoung.co.kr'];

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  try {
    const parsed = new URL(url);
    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
      return NextResponse.json({ error: 'domain not allowed' }, { status: 403 });
    }

    const res = await fetch(url, {
      headers: {
        Referer: `https://${parsed.hostname}/`,
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'fetch failed' }, { status: res.status });
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = await res.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }
}
