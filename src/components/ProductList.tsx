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
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:brightness-95 transition-all text-left"
                    style={{ background: `${meta.color}10` }}
                  >
                    <div className="w-12 h-12 rounded-lg shrink-0 bg-white/80 flex items-center justify-center overflow-hidden">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl.replace('img.daisomall.co.kr', 'cdn.daisomall.co.kr')}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<span style="font-size:18px">🛒</span>';
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: 18 }}>🛒</span>
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
