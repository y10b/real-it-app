'use client';

import { useState, FormEvent } from 'react';
import { SearchCategory, SEARCH_CATEGORIES, STORE_META } from '@/types';

interface Props {
  onSearch: (query: string, category: SearchCategory) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<SearchCategory>('all');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed, category);
  };

  const getCategoryColor = (key: SearchCategory, active: boolean) => {
    if (key === 'all') return active ? { bg: '#3B82F6', text: 'white', border: '#3B82F6' } : { bg: 'white', text: '#3B82F6', border: '#3B82F6' };
    if (key === 'daiso') return active ? { bg: STORE_META.daiso.color, text: 'white', border: STORE_META.daiso.color } : { bg: 'white', text: STORE_META.daiso.color, border: STORE_META.daiso.color };
    if (key === 'convenience') return active ? { bg: STORE_META.cu.color, text: 'white', border: STORE_META.cu.color } : { bg: 'white', text: STORE_META.cu.color, border: STORE_META.cu.color };
    if (key === 'oliveyoung') return active ? { bg: STORE_META.oliveyoung.color, text: 'white', border: STORE_META.oliveyoung.color } : { bg: 'white', text: STORE_META.oliveyoung.color, border: STORE_META.oliveyoung.color };
    return { bg: 'white', text: '#666', border: '#ccc' };
  };

  return (
    <div className="px-4 py-3 w-full max-w-full overflow-hidden box-border">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-2 w-full">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="상품 검색 (예: 선크림, 컵라면)"
            className="flex-1 min-w-0 px-3 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
          />
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="shrink-0 px-4 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
          >
            {loading ? '...' : '검색'}
          </button>
        </div>
      </form>
      <p className="text-[11px] text-gray-400 mt-2 mb-1 px-0.5">검색 카테고리</p>
      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
        {SEARCH_CATEGORIES.map((cat) => {
          const active = category === cat.key;
          const colors = getCategoryColor(cat.key, active);
          return (
            <button
              key={cat.key}
              onClick={() => {
                setCategory(cat.key);
                const trimmed = query.trim();
                if (trimmed) onSearch(trimmed, cat.key);
              }}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all border"
              style={{
                backgroundColor: colors.bg,
                color: colors.text,
                borderColor: colors.border,
                opacity: active ? 1 : 0.5,
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
