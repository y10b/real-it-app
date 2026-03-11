'use client';

import { useState, useCallback, useEffect } from 'react';
import KakaoMap from '@/components/KakaoMap';
import StoreFilter from '@/components/StoreFilter';
import SearchBar from '@/components/SearchBar';
import StoreDetail from '@/components/StoreDetail';
import ProductList from '@/components/ProductList';
import InventoryList from '@/components/InventoryList';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { StoreType, StoreInfo, ProductInfo, InventoryInfo } from '@/types';
import {
  getDaisoStores,
  getOliveyoungStores,
  getCuStores,
  getEmart24Stores,
  getMegaboxTheaters,
  getLottecinemaTheaters,
  getCgvTheaters,
  searchDaisoProducts,
  getDaisoInventory,
} from '@/api/stores';

type ViewState = 'map' | 'products' | 'inventory';

export default function Home() {
  const geo = useGeolocation();
  const addr = useReverseGeocode(geo.lat, geo.lng, geo.loaded);
  const [stores, setStores] = useState<StoreInfo[]>([]);
  const [activeFilters, setActiveFilters] = useState<Set<StoreType>>(
    new Set(['daiso', 'cu', 'emart24', 'oliveyoung', 'megabox', 'lottecinema', 'cgv'])
  );
  const [selectedStore, setSelectedStore] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [inventory, setInventory] = useState<InventoryInfo[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [viewState, setViewState] = useState<ViewState>('map');

  const loadNearbyStores = useCallback(async (
    lat: number, lng: number, filters: Set<StoreType>,
    region: { sido: string; gugun: string; dong: string }
  ) => {
    setStoresLoading(true);
    const results: StoreInfo[] = [];

    const fetchers: Array<{ type: StoreType; fn: () => Promise<any> }> = [];

    if (filters.has('daiso')) {
      fetchers.push({
        type: 'daiso',
        fn: () => getDaisoStores({ sido: region.sido, gugun: region.gugun }),
      });
    }
    if (filters.has('oliveyoung')) {
      fetchers.push({ type: 'oliveyoung', fn: () => getOliveyoungStores(lat, lng) });
    }
    if (filters.has('cu')) {
      fetchers.push({ type: 'cu', fn: () => getCuStores(lat, lng) });
    }
    if (filters.has('emart24')) {
      fetchers.push({ type: 'emart24', fn: () => getEmart24Stores(lat, lng) });
    }
    if (filters.has('megabox')) {
      fetchers.push({ type: 'megabox', fn: () => getMegaboxTheaters(lat, lng) });
    }
    if (filters.has('lottecinema')) {
      fetchers.push({ type: 'lottecinema', fn: () => getLottecinemaTheaters(lat, lng) });
    }
    if (filters.has('cgv')) {
      fetchers.push({ type: 'cgv', fn: () => getCgvTheaters() });
    }

    const responses = await Promise.allSettled(fetchers.map((f) => f.fn()));

    responses.forEach((res, i) => {
      if (res.status !== 'fulfilled') return;
      const data = res.value;
      const type = fetchers[i].type;

      const storeList = data?.data?.stores || data?.data?.theaters || data?.data || [];
      if (!Array.isArray(storeList)) return;

      storeList.forEach((s: any) => {
        const storeLat = s.lat || s.latitude;
        const storeLng = s.lng || s.longitude;
        if (!storeLat || !storeLng) return;

        results.push({
          type,
          name: s.name || s.storeName || s.theaterName || '',
          address: s.address || s.addr || '',
          lat: Number(storeLat),
          lng: Number(storeLng),
          storeCode: s.storeCode || s.theaterCode || s.code || '',
          distance: s.distance || '',
          phone: s.phone || s.tel || '',
        });
      });
    });

    setStores(results);
    setStoresLoading(false);
  }, []);

  useEffect(() => {
    if (geo.loaded && !geo.error && addr.loaded) {
      loadNearbyStores(geo.lat, geo.lng, activeFilters, {
        sido: addr.sido,
        gugun: addr.gugun,
        dong: addr.dong,
      });
    }
  }, [geo.loaded, geo.error, geo.lat, geo.lng, addr.loaded, addr.sido, addr.gugun, addr.dong, activeFilters, loadNearbyStores]);

  const handleToggleFilter = useCallback((type: StoreType) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    setSearchLoading(true);
    setViewState('products');
    try {
      const res = await searchDaisoProducts(query);
      const list = res?.data?.products || res?.data || [];
      const mapped: ProductInfo[] = Array.isArray(list)
        ? list.map((p: any) => ({
            id: p.id || p.productId || '',
            name: p.name || p.productName || '',
            price: p.price || p.salePrice || 0,
            imageUrl: p.imageUrl || p.image || '',
          }))
        : [];
      setProducts(mapped);
    } catch {
      setProducts([]);
    }
    setSearchLoading(false);
  }, []);

  const handleSelectProduct = useCallback(async (product: ProductInfo) => {
    setSearchLoading(true);
    setViewState('inventory');
    try {
      const res = await getDaisoInventory(product.id, geo.lat, geo.lng);
      const list = res?.data?.stores || res?.data?.inventory || res?.data || [];
      const mapped: InventoryInfo[] = Array.isArray(list)
        ? list.map((s: any) => ({
            storeName: s.storeName || s.name || '',
            storeCode: s.storeCode || '',
            address: s.address || s.addr || '',
            stock: s.stockStatus || s.stock || s.inventoryStatus || '정보없음',
            distance: s.distance || '',
            lat: s.lat,
            lng: s.lng,
          }))
        : [];
      setInventory(mapped);
    } catch {
      setInventory([]);
    }
    setSearchLoading(false);
  }, [geo.lat, geo.lng]);

  const filteredStores = stores.filter((s) => activeFilters.has(s.type));

  if (!geo.loaded) {
    return (
      <div className="h-dvh flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">위치 정보를 가져오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col bg-white relative overflow-hidden">
      <div className="relative z-10 bg-white shadow-sm">
        <SearchBar onSearch={handleSearch} loading={searchLoading} />
        <StoreFilter activeFilters={activeFilters} onToggle={handleToggleFilter} />
      </div>

      {storesLoading && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
          <p className="text-xs text-gray-500">매장 불러오는 중...</p>
        </div>
      )}

      <div className="flex-1 relative">
        <KakaoMap
          lat={geo.lat}
          lng={geo.lng}
          stores={filteredStores}
          onStoreClick={setSelectedStore}
        />

        {geo.error && (
          <div className="absolute top-3 left-3 right-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 z-10">
            <p className="text-xs text-yellow-700">{geo.error}</p>
            <p className="text-xs text-yellow-500 mt-1">기본 위치(서울 시청)로 표시됩니다.</p>
          </div>
        )}

        {selectedStore && viewState === 'map' && (
          <StoreDetail store={selectedStore} onClose={() => setSelectedStore(null)} />
        )}

        {viewState === 'products' && (
          <ProductList
            products={products}
            onSelect={handleSelectProduct}
            onClose={() => setViewState('map')}
          />
        )}

        {viewState === 'inventory' && (
          <InventoryList
            items={inventory}
            storeName=""
            onClose={() => setViewState('products')}
          />
        )}
      </div>
    </div>
  );
}
