'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import KakaoMap from '@/components/KakaoMap';
import StoreFilter from '@/components/StoreFilter';
import SearchBar from '@/components/SearchBar';
import StoreDetail from '@/components/StoreDetail';
import ProductList from '@/components/ProductList';
import InventoryList from '@/components/InventoryList';
import ShowtimeList from '@/components/ShowtimeList';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useReverseGeocode } from '@/hooks/useReverseGeocode';
import { StoreType, StoreInfo, ProductInfo, InventoryInfo, ShowtimeInfo, CINEMA_TYPES, SearchCategory, SEARCH_CATEGORIES } from '@/types';
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
  getOliveyoungInventory,
  getCuInventory,
  searchEmart24Products,
  getEmart24Inventory,
  getMegaboxSeats,
  getLottecinemaSeats,
  getCgvTimetable,
} from '@/api/stores';

type ViewState = 'map' | 'products' | 'inventory' | 'showtimes';

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
  const [showtimes, setShowtimes] = useState<ShowtimeInfo[]>([]);
  const [focusLocation, setFocusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [showtimeLoading, setShowtimeLoading] = useState(false);
  // CU/올리브영 검색 시 반환된 매장 재고 캐시
  const cachedStoresRef = useRef<{ cu: any[]; oliveyoung: any[] }>({ cu: [], oliveyoung: [] });
  const [viewState, setViewState] = useState<ViewState>('map');

  const parseStores = (data: any, type: StoreType): StoreInfo[] => {
    const storeList = data?.theaters || data?.data?.stores || data?.data?.theaters || data?.data || [];
    if (!Array.isArray(storeList)) return [];

    return storeList
      .map((s: any) => {
        const storeLat = s.lat || s.latitude;
        const storeLng = s.lng || s.longitude;
        if (!storeLat || !storeLng) return null;

        return {
          type,
          name: s.name || s.storeName || s.theaterName || '',
          address: s.address || s.addr || '',
          lat: Number(storeLat),
          lng: Number(storeLng),
          storeCode: s.storeCode || s.theaterCode || s.theaterId || s.code || '',
          distance: s.distance || s.distanceKm || '',
          phone: s.phone || s.tel || '',
          regionCode: s.regionCode || '',
          regionDetailCode: s.regionDetailCode || '',
        } as StoreInfo;
      })
      .filter(Boolean) as StoreInfo[];
  };

  const loadNearbyStores = useCallback(async (
    lat: number, lng: number, filters: Set<StoreType>,
    region: { sido: string; gugun: string; dong: string }
  ) => {
    setStoresLoading(true);
    setStores([]);

    const fetchers: Array<{ type: StoreType; fn: () => Promise<any> }> = [];

    if (filters.has('daiso')) {
      fetchers.push({ type: 'daiso', fn: () => getDaisoStores({ sido: region.sido, gugun: region.gugun }) });
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
      fetchers.push({ type: 'cgv', fn: () => getCgvTheaters(lat, lng) });
    }

    // 각 API가 응답하는 대로 즉시 지도에 반영
    let pending = fetchers.length;
    fetchers.forEach(({ type, fn }) => {
      fn()
        .then((data) => {
          const parsed = parseStores(data, type);
          if (parsed.length > 0) {
            setStores((prev) => [...prev, ...parsed]);
          }
        })
        .catch(() => {})
        .finally(() => {
          pending--;
          if (pending === 0) setStoresLoading(false);
        });
    });

    if (fetchers.length === 0) setStoresLoading(false);
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

  const handleStoreClick = useCallback(async (store: StoreInfo) => {
    setSelectedStore(store);

    // 영화관이면 상영 정보 자동 로드
    if (CINEMA_TYPES.includes(store.type) && store.storeCode) {
      setShowtimeLoading(true);
      setViewState('showtimes');
      try {
        let seats: ShowtimeInfo[] = [];

        if (store.type === 'megabox') {
          const res = await getMegaboxSeats(store.storeCode);
          const list = res?.data?.seats || [];
          seats = list.map((s: any) => ({
            movieName: s.movieName || '',
            startTime: s.startTime || '',
            endTime: s.endTime || '',
            totalSeats: s.totalSeats || 0,
            remainingSeats: s.remainingSeats || 0,
            screenName: s.screenName || '',
          }));
        } else if (store.type === 'lottecinema') {
          const res = await getLottecinemaSeats(
            store.storeCode,
            store.regionCode || '1',
            store.regionDetailCode || '0001'
          );
          const list = res?.data?.seats || [];
          seats = list.map((s: any) => ({
            movieName: s.movieName || '',
            startTime: s.startTime || '',
            endTime: s.endTime || '',
            totalSeats: s.totalSeats || 0,
            remainingSeats: s.remainingSeats || 0,
            screenName: s.screenName || '',
          }));
        } else if (store.type === 'cgv') {
          const res = await getCgvTimetable(store.storeCode);
          const list = res?.data?.timetable || [];
          seats = list.map((s: any) => ({
            movieName: s.movieName || '',
            startTime: s.startTime || '',
            endTime: s.endTime || '',
            totalSeats: s.totalSeats || 0,
            remainingSeats: s.remainingSeats || 0,
            screenName: s.screenName || '',
          }));
        }

        setShowtimes(seats);
      } catch {
        setShowtimes([]);
      }
      setShowtimeLoading(false);
    } else {
      setViewState('map');
    }
  }, []);

  const handleSearch = useCallback(async (query: string, category: SearchCategory = 'all') => {
    setSearchLoading(true);
    setSelectedStore(null);
    setProducts([]);
    setViewState('products');

    const allowedStores = SEARCH_CATEGORIES.find((c) => c.key === category)?.stores || [];

    const searches: Promise<ProductInfo[]>[] = [];

    if (allowedStores.includes('daiso')) {
      searches.push(
        searchDaisoProducts(query)
          .then((res) => {
            const list = res?.data?.products || res?.data || [];
            return Array.isArray(list)
              ? list.map((p: any): ProductInfo => ({
                  id: p.id || p.productId || '',
                  name: p.name || p.productName || '',
                  price: p.price || p.salePrice || 0,
                  imageUrl: p.imageUrl || p.image || '',
                  source: 'daiso',
                }))
              : [];
          })
          .catch(() => [] as ProductInfo[])
      );
    }

    if (allowedStores.includes('cu')) {
      searches.push(
        getCuInventory(query, geo.lat, geo.lng)
          .then((res) => {
            const items = res?.data?.inventory?.items || [];
            const nearbyStores = res?.data?.nearbyStores?.stores || [];
            cachedStoresRef.current.cu = nearbyStores;
            if (!Array.isArray(items) || items.length === 0) return [];
            return items.slice(0, 20).map((p: any): ProductInfo => ({
              id: p.itemCode || p.onItemNo || '',
              name: p.itemName || '',
              price: p.price || 0,
              source: 'cu',
            }));
          })
          .catch(() => [] as ProductInfo[])
      );
    }

    if (allowedStores.includes('oliveyoung')) {
      searches.push(
        getOliveyoungInventory(query, geo.lat, geo.lng)
          .then((res) => {
            const stores = res?.data?.nearbyStores?.stores || [];
            const products = res?.data?.inventory?.products || [];
            cachedStoresRef.current.oliveyoung = stores;
            if (!Array.isArray(products) || products.length === 0) return [];
            return products.slice(0, 20).map((p: any): ProductInfo => ({
              id: p.goodsNumber || p.goodsNo || '',
              name: p.goodsName || p.name || '',
              price: p.priceToPay || p.originalPrice || 0,
              source: 'oliveyoung',
            }));
          })
          .catch(() => [] as ProductInfo[])
      );
    }

    if (allowedStores.includes('emart24')) {
      searches.push(
        searchEmart24Products(query)
          .then((res) => {
            const list = res?.data?.products || [];
            return Array.isArray(list) && list.length > 0
              ? list.map((p: any): ProductInfo => ({
                  id: p.pluCd || '',
                  name: p.goodsName || '',
                  price: p.viewPrice || p.originPrice || 0,
                  source: 'emart24',
                  pluCd: p.pluCd || '',
                }))
              : [];
          })
          .catch(() => [] as ProductInfo[])
      );
    }

    // 각 결과가 오는 대로 바로 표시
    searches.forEach((p) => {
      p.then((items) => {
        if (items.length > 0) {
          setProducts((prev) => [...prev, ...items]);
        }
      });
    });

    await Promise.allSettled(searches);
    setSearchLoading(false);
  }, [geo.lat, geo.lng]);

  const parseInventoryList = (stores: any[], source: StoreType): InventoryInfo[] => {
    if (!Array.isArray(stores)) return [];
    return stores.map((s: any) => {
      const qty = s.quantity ?? s.stock ?? null;
      let stockLabel: string;
      if (qty === null || qty === undefined) {
        stockLabel = '정보없음';
      } else if (qty === 0) {
        stockLabel = '품절';
      } else if (qty <= 5) {
        stockLabel = `소량 (${qty}개)`;
      } else {
        stockLabel = `재고있음 (${qty}개)`;
      }
      return {
        storeName: s.storeName || s.name || '',
        storeCode: s.storeCode || '',
        address: s.address || s.addr || '',
        stock: stockLabel,
        distance: s.distance ? `${s.distance}km` : '',
        lat: s.lat || s.latitude,
        lng: s.lng || s.longitude,
        source,
      };
    });
  };

  const handleSelectProduct = useCallback(async (product: ProductInfo) => {
    setSearchLoading(true);
    setViewState('inventory');
    try {
      let mapped: InventoryInfo[] = [];

      if (product.source === 'daiso') {
        const res = await getDaisoInventory(product.id, geo.lat, geo.lng);
        const storeList = res?.data?.storeInventory?.stores || res?.data?.stores || res?.data?.inventory || [];
        mapped = parseInventoryList(storeList, 'daiso');
      } else if (product.source === 'cu') {
        // CU: 캐시된 매장 재고 사용 (검색 시 이미 받아옴)
        const storeList = cachedStoresRef.current.cu;
        mapped = Array.isArray(storeList) ? storeList.map((s: any): InventoryInfo => {
          const qty = s.stock ?? null;
          let stockLabel: string;
          if (qty === null || qty === undefined) stockLabel = '정보없음';
          else if (qty === 0) stockLabel = '품절';
          else if (qty <= 5) stockLabel = `소량 (${qty}개)`;
          else stockLabel = `재고있음 (${qty}개)`;
          return {
            storeName: s.storeName || '',
            storeCode: s.storeCode || '',
            address: s.address || '',
            stock: stockLabel,
            distance: s.distanceM ? `${(s.distanceM / 1000).toFixed(1)}km` : '',
            lat: s.latitude,
            lng: s.longitude,
            source: 'cu',
          };
        }) : [];
      } else if (product.source === 'oliveyoung') {
        // 올리브영: 캐시된 매장 재고 사용 (검색 시 이미 받아옴)
        const storeList = cachedStoresRef.current.oliveyoung;
        mapped = Array.isArray(storeList) ? storeList.map((s: any): InventoryInfo => {
          // o2oStockFlag: 픽업 가능 여부, pickupYn: 픽업 서비스 지원 여부
          const hasStock = s.o2oStockFlag || s.pickupYn;
          const stockLabel = hasStock ? '재고있음' : '품절';
          return {
            storeName: s.storeName || '',
            storeCode: s.storeCode || '',
            address: s.address || '',
            stock: stockLabel,
            distance: '',
            lat: s.latitude,
            lng: s.longitude,
            source: 'oliveyoung',
          };
        }) : [];
      } else if (product.source === 'emart24' && product.pluCd) {
        // 1. 주변 매장 목록 가져오기
        const storesRes = await getEmart24Stores(geo.lat, geo.lng);
        const nearbyStores = storesRes?.data?.stores || [];
        if (Array.isArray(nearbyStores) && nearbyStores.length > 0) {
          // 2. 매장 코드 목록으로 재고 조회 (최대 30개)
          const bizNoArr = nearbyStores.slice(0, 30).map((s: any) => s.storeCode).join(',');
          const invRes = await getEmart24Inventory(product.pluCd, bizNoArr);
          const invStores = invRes?.data?.stores || [];
          // 매장 정보 매핑 (재고 API는 bizNo, bizQty만 반환하므로 주변 매장 정보와 합침)
          const storeMap = new Map(nearbyStores.map((s: any) => [s.storeCode, s]));
          mapped = Array.isArray(invStores) ? invStores.map((s: any): InventoryInfo => {
            const info: any = storeMap.get(s.bizNo) || {};
            const qty = s.bizQty ?? 0;
            let stockLabel: string;
            if (qty === 0) stockLabel = '품절';
            else if (qty <= 5) stockLabel = `소량 (${qty}개)`;
            else stockLabel = `재고있음 (${qty}개)`;
            return {
              storeName: s.storeName || info.storeName || '',
              storeCode: s.bizNo || '',
              address: s.address || info.address || '',
              stock: stockLabel,
              distance: info.distanceM ? `${(info.distanceM / 1000).toFixed(1)}km` : '',
              lat: info.latitude,
              lng: info.longitude,
              source: 'emart24',
            };
          }) : [];
        }
      }

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
          onStoreClick={handleStoreClick}
          focusLocation={focusLocation}
          inventoryMarkers={viewState === 'inventory' ? inventory : undefined}
          onInventoryMarkerClick={(item) => {
            if (item.lat && item.lng) {
              setFocusLocation({ lat: item.lat, lng: item.lng });
            }
          }}
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

        {viewState === 'showtimes' && selectedStore && (
          <ShowtimeList
            store={selectedStore}
            showtimes={showtimes}
            loading={showtimeLoading}
            onClose={() => {
              setViewState('map');
              setSelectedStore(null);
            }}
          />
        )}

        {viewState === 'products' && (
          <ProductList
            products={products}
            onSelect={handleSelectProduct}
            onClose={() => setViewState('map')}
            loading={searchLoading}
          />
        )}

        {viewState === 'inventory' && (
          <InventoryList
            items={inventory}
            storeName=""
            onClose={() => setViewState('products')}
            userLat={geo.lat}
            userLng={geo.lng}
          />
        )}
      </div>
    </div>
  );
}
