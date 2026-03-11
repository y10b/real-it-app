'use client';

import { InventoryInfo } from '@/types';

interface Props {
  items: InventoryInfo[];
  storeName: string;
  onClose: () => void;
}

export default function InventoryList({ items, storeName, onClose }: Props) {
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
            {items.map((item, i) => (
              <li key={i} className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.storeName}</p>
                  <p className="text-xs text-gray-400 truncate">{item.address}</p>
                  {item.distance && <p className="text-xs text-blue-500 mt-0.5">{item.distance}</p>}
                </div>
                <span
                  className={`shrink-0 ml-3 px-3 py-1 rounded-full text-xs font-bold ${
                    item.stock === '재고있음' || item.stock === '충분'
                      ? 'bg-green-100 text-green-700'
                      : item.stock === '부족' || item.stock === '소량'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.stock}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
