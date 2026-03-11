'use client';

import { InventoryInfo, STORE_META } from '@/types';

interface Props {
  items: InventoryInfo[];
  storeName: string;
  onClose: () => void;
  userLat?: number;
  userLng?: number;
}

export default function InventoryList({ items, storeName, onClose, userLat, userLng }: Props) {
  const openNavigation = (item: InventoryInfo) => {
    if (!item.lat || !item.lng) return;
    // 카카오맵 길찾기 URL (출발지: 현재위치, 도착지: 매장)
    const name = encodeURIComponent(item.storeName);
    let url: string;
    if (userLat && userLng) {
      url = `https://map.kakao.com/link/from/내 위치,${userLat},${userLng}/to/${name},${item.lat},${item.lng}`;
    } else {
      url = `https://map.kakao.com/link/to/${name},${item.lat},${item.lng}`;
    }
    window.open(url, '_blank');
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-30 animate-slide-up max-h-[60vh] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">
          재고 현황 <span className="text-sm font-normal text-gray-400">({items.length}개 매장)</span>
        </h3>
        <button onClick={onClose} className="text-gray-400 text-xl leading-none p-1">
          &times;
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-4">
        {items.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">주변 매장에 재고가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((item, i) => {
              const meta = item.source ? STORE_META[item.source] : null;
              return (
                <li
                  key={i}
                  className={`flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl ${
                    item.lat && item.lng ? 'cursor-pointer hover:bg-gray-100 active:bg-gray-200 transition-colors' : ''
                  }`}
                  onClick={() => openNavigation(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {meta && (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold shrink-0"
                          style={{ background: meta.color }}
                        >
                          {meta.label}
                        </span>
                      )}
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.storeName}</p>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{item.address}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.distance && <span className="text-xs text-blue-500">{item.distance}</span>}
                      {item.lat && item.lng && (
                        <span className="text-[10px] text-blue-400">길찾기 &rsaquo;</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 ml-3 px-3 py-1 rounded-full text-xs font-bold ${
                      item.stock.includes('재고있음')
                        ? 'bg-green-100 text-green-700'
                        : item.stock.includes('소량')
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.stock}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
