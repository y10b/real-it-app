const BASE_URL = 'https://mcp.aka.page';

export async function searchDaisoProducts(query: string, page = 1) {
  const res = await fetch(`${BASE_URL}/api/daiso/products?q=${encodeURIComponent(query)}&page=${page}&pageSize=30`);
  return res.json();
}

export async function getDaisoStores(opts: { keyword?: string; sido?: string; gugun?: string; dong?: string }) {
  const params = new URLSearchParams();
  if (opts.keyword) params.set('keyword', opts.keyword);
  if (opts.sido) params.set('sido', opts.sido);
  if (opts.gugun) params.set('gugun', opts.gugun);
  if (opts.dong) params.set('dong', opts.dong);
  params.set('limit', '50');
  const res = await fetch(`${BASE_URL}/api/daiso/stores?${params}`);
  return res.json();
}

export async function getDaisoInventory(productId: string, lat: number, lng: number) {
  const res = await fetch(`${BASE_URL}/api/daiso/inventory?productId=${productId}&lat=${lat}&lng=${lng}&pageSize=30`);
  return res.json();
}

export async function getOliveyoungStores(lat: number, lng: number, keyword?: string) {
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng) });
  if (keyword) params.set('keyword', keyword);
  const res = await fetch(`${BASE_URL}/api/oliveyoung/stores?${params}`);
  return res.json();
}

export async function getOliveyoungInventory(keyword: string, lat: number, lng: number) {
  const res = await fetch(`${BASE_URL}/api/oliveyoung/inventory?keyword=${encodeURIComponent(keyword)}&lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function getCuStores(lat: number, lng: number) {
  const res = await fetch(`${BASE_URL}/api/cu/stores?lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function getCuInventory(keyword: string, lat: number, lng: number) {
  const res = await fetch(`${BASE_URL}/api/cu/inventory?keyword=${encodeURIComponent(keyword)}&lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function getEmart24Stores(lat: number, lng: number) {
  const res = await fetch(`${BASE_URL}/api/emart24/stores?lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function searchEmart24Products(keyword: string, page = 1) {
  const res = await fetch(`${BASE_URL}/api/emart24/products?keyword=${encodeURIComponent(keyword)}&page=${page}&pageSize=20`);
  return res.json();
}

export async function getEmart24Inventory(pluCd: string, bizNoArr: string) {
  const res = await fetch(`${BASE_URL}/api/emart24/inventory?pluCd=${pluCd}&bizNoArr=${bizNoArr}`);
  return res.json();
}

export async function getMegaboxTheaters(lat: number, lng: number) {
  const res = await fetch(`${BASE_URL}/api/megabox/theaters?lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function getLottecinemaTheaters(lat: number, lng: number) {
  const res = await fetch(`${BASE_URL}/api/lottecinema/theaters?lat=${lat}&lng=${lng}`);
  return res.json();
}

export async function getCgvTheaters(lat: number, lng: number) {
  const res = await fetch(`https://real-it-app.vercel.app/api/cgv-locations?lat=${lat}&lng=${lng}`);
  return res.json();
}

// 영화 상영 정보
export async function getMegaboxSeats(theaterId: string) {
  const res = await fetch(`${BASE_URL}/api/megabox/seats?theaterId=${theaterId}`);
  return res.json();
}

export async function getLottecinemaSeats(theaterId: string, regionCode: string, regionDetailCode: string) {
  const res = await fetch(`${BASE_URL}/api/lottecinema/seats?theaterId=${theaterId}&regionCode=${regionCode}&regionDetailCode=${regionDetailCode}`);
  return res.json();
}

export async function getCgvTimetable(theaterCode: string) {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const res = await fetch(`${BASE_URL}/api/cgv/timetable?playDate=${today}&theaterCode=${theaterCode}`);
  return res.json();
}
