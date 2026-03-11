'use client';

import { ProductInfo } from '@/types';

interface Props {
  products: ProductInfo[];
  onSelect: (product: ProductInfo) => void;
  onClose: () => void;
}

export default function ProductList({ products, onSelect, onClose }: Props) {
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
        {products.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">검색 결과가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {products.map((product) => (
              <li key={product.id}>
                <button
                  onClick={() => onSelect(product)}
                  className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left"
                >
                  {product.imageUrl && (
                    <img
                      src={`/api/image?url=${encodeURIComponent(product.imageUrl)}`}
                      alt={product.name}
                      className="w-12 h-12 rounded-lg object-cover shrink-0 bg-white"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                    <p className="text-sm text-red-500 font-bold">{product.price.toLocaleString()}원</p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">재고확인 &rsaquo;</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
