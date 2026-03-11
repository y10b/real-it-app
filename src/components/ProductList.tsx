'use client';

import { ProductInfo, STORE_META } from '@/types';

interface Props {
  products: ProductInfo[];
  onSelect: (product: ProductInfo) => void;
  onClose: () => void;
  loading?: boolean;
}

export default function ProductList({ products, onSelect, onClose, loading }: Props) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-30 animate-slide-up max-h-[60vh] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-900">
          검색 결과 <span className="text-sm font-normal text-gray-400">({products.length}개)</span>
        </h3>
        <button onClick={onClose} className="text-gray-400 text-xl leading-none p-1">
          &times;
        </button>
      </div>
      <div className="overflow-y-auto flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-2 text-sm text-gray-400">검색 중...</span>
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">검색 결과가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((product, idx) => {
              const meta = STORE_META[product.source];
              return (
                <li key={`${product.source}-${product.id}-${idx}`}>
                  <button
                    onClick={() => onSelect(product)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                  >
                    <div
                      className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: product.imageUrl ? '#f3f4f6' : `${meta.color}20` }}
                    >
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl.replace('img.daisomall.co.kr', 'cdn.daisomall.co.kr')}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const parent = (e.target as HTMLImageElement).parentElement!;
                            parent.style.background = `${meta.color}20`;
                            parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${meta.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>`;
                          }}
                        />
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full text-white font-bold shrink-0"
                          style={{ background: meta.color }}
                        >
                          {meta.label}
                        </span>
                        <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                      </div>
                      {product.price > 0 && (
                        <p className="text-sm text-red-500 font-bold">{product.price.toLocaleString()}원</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">재고확인 &rsaquo;</span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
