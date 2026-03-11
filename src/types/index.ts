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
}

export interface ProductInfo {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

export interface InventoryInfo {
  storeName: string;
  storeCode: string;
  address: string;
  stock: string;
  distance?: string;
  lat?: number;
  lng?: number;
}

export const STORE_META: Record<StoreType, { label: string; color: string; emoji: string }> = {
  daiso: { label: '다이소', color: '#ED1C24', emoji: '🔴' },
  cu: { label: 'CU', color: '#652F8D', emoji: '🟣' },
  emart24: { label: '이마트24', color: '#FFB81C', emoji: '🟡' },
  oliveyoung: { label: '올리브영', color: '#9FCE67', emoji: '🟢' },
  megabox: { label: '메가박스', color: '#352263', emoji: '🎬' },
  lottecinema: { label: '롯데시네마', color: '#E40012', emoji: '🎞️' },
  cgv: { label: 'CGV', color: '#E71A0F', emoji: '🎥' },
};
