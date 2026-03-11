'use client';

import { StoreInfo, STORE_META } from '@/types';

interface Props {
  store: StoreInfo;
  onClose: () => void;
}

export default function StoreDetail({ store, onClose }: Props) {
  const meta = STORE_META[store.type];

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] p-5 z-20 animate-slide-up">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span
            className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white mb-1"
            style={{ backgroundColor: meta.color }}
          >
            {meta.label}
          </span>
          <h3 className="text-lg font-bold text-gray-900">{store.name}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 text-xl leading-none p-1">
          &times;
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-2">{store.address}</p>
      {store.distance && (
        <p className="text-sm text-blue-500 font-medium">{store.distance}</p>
      )}
      {store.phone && (
        <a href={`tel:${store.phone}`} className="text-sm text-gray-600 underline">
          {store.phone}
        </a>
      )}
    </div>
  );
}
