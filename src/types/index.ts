export type StoreType = 'daiso' | 'cu' | 'emart24' | 'oliveyoung' | 'megabox' | 'lottecinema' | 'cgv';

export interface StoreInfo {
  type: StoreType;
  name: string;
  address: string;
  lat: number;
  lng: number;
  storeCode?: string;
  distance?: string;
  phone?: string;
  regionCode?: string;
  regionDetailCode?: string;
}

export interface ShowtimeInfo {
  movieName: string;
  startTime: string;
  endTime: string;
  totalSeats: number;
  remainingSeats: number;
  screenName?: string;
}

export const CINEMA_TYPES: StoreType[] = ['megabox', 'lottecinema', 'cgv'];

export const BOOKING_URLS: Record<string, string> = {
  megabox: 'https://www.megabox.co.kr/booking',
  lottecinema: 'https://www.lottecinema.co.kr/NLCHS/Ticketing',
  cgv: 'https://www.cgv.co.kr/ticket/',
};

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  source: StoreType;
  pluCd?: string; // 이마트24용
}

export type SearchableStore = 'daiso' | 'cu' | 'oliveyoung' | 'emart24';

export type SearchCategory = 'all' | 'daiso' | 'convenience' | 'oliveyoung';

export const SEARCH_CATEGORIES: { key: SearchCategory; label: string; stores: SearchableStore[] }[] = [
  { key: 'all', label: '전체', stores: ['daiso', 'cu', 'oliveyoung', 'emart24'] },
  { key: 'daiso', label: '다이소', stores: ['daiso'] },
  { key: 'convenience', label: '편의점', stores: ['cu', 'emart24'] },
  { key: 'oliveyoung', label: '올리브영', stores: ['oliveyoung'] },
];

export interface InventoryInfo {
  storeName: string;
  storeCode: string;
  address: string;
  stock: string;
  distance?: string;
  lat?: number;
  lng?: number;
  source?: StoreType;
}

export const STORE_META: Record<StoreType, { label: string; color: string; emoji: string }> = {
  daiso: { label: '다이소', color: '#ED1C24', emoji: '🔴' },
  cu: { label: 'CU', color: '#652F8D', emoji: '🟣' },
  emart24: { label: '이마트24', color: '#FFB81C', emoji: '🟡' },
  oliveyoung: { label: '올리브영', color: '#9FCE67', emoji: '🟢' },
  megabox: { label: '메가박스', color: '#352263', emoji: '🎬' },
  lottecinema: { label: '롯데시네마', color: '#C62368', emoji: '🎞️' },
  cgv: { label: 'CGV', color: '#F57C00', emoji: '🎥' },
};
