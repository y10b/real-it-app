'use client';

import { useState, FormEvent } from 'react';

interface Props {
  onSearch: (query: string) => void;
  loading: boolean;
}

export default function SearchBar({ onSearch, loading }: Props) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="상품을 검색하세요 (예: 수납박스, 선크림)"
          className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-5 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40 transition-opacity"
        >
          {loading ? '...' : '검색'}
        </button>
      </div>
    </form>
  );
}
