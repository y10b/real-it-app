'use client';

import { StoreType, STORE_META } from '@/types';

interface Props {
  activeFilters: Set<StoreType>;
  onToggle: (type: StoreType) => void;
}

const ALL_TYPES: StoreType[] = ['daiso', 'cu', 'emart24', 'oliveyoung', 'megabox', 'lottecinema', 'cgv'];

export default function StoreFilter({ activeFilters, onToggle }: Props) {
  return (
    <div className="px-4 pt-1 pb-2">
      <p className="text-[11px] text-gray-400 mb-1 px-0.5">지도 매장 필터</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
      {ALL_TYPES.map((type) => {
        const meta = STORE_META[type];
        const active = activeFilters.has(type);
        return (
          <button
            key={type}
            onClick={() => onToggle(type)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
            style={{
              backgroundColor: active ? meta.color : 'white',
              color: active ? 'white' : meta.color,
              borderColor: meta.color,
              opacity: active ? 1 : 0.6,
            }}
          >
            {meta.label}
          </button>
        );
      })}
      </div>
    </div>
  );
}
