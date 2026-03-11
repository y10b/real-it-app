'use client';

import { ShowtimeInfo, StoreInfo, STORE_META, BOOKING_URLS } from '@/types';

interface Props {
  store: StoreInfo;
  showtimes: ShowtimeInfo[];
  loading: boolean;
  onClose: () => void;
}

export default function ShowtimeList({ store, showtimes, loading, onClose }: Props) {
  const meta = STORE_META[store.type];
  const bookingUrl = BOOKING_URLS[store.type];

  // 영화별로 그룹핑
  const grouped = showtimes.reduce<Record<string, ShowtimeInfo[]>>((acc, s) => {
    if (!acc[s.movieName]) acc[s.movieName] = [];
    acc[s.movieName].push(s);
    return acc;
  }, {});

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)] z-30 animate-slide-up max-h-[70vh] flex flex-col">
      {/* 헤더 */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: meta.color }}
            >
              {meta.label}
            </span>
            <h3 className="text-base font-bold text-gray-900">{store.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none p-1">
            &times;
          </button>
        </div>
        {store.address && <p className="text-xs text-gray-400">{store.address}</p>}
        {bookingUrl && (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: meta.color }}
          >
            예매하기
          </a>
        )}
      </div>

      {/* 상영 목록 */}
      <div className="overflow-y-auto flex-1 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        ) : Object.keys(grouped).length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">상영 정보가 없습니다.</p>
        ) : (
          <div className="space-y-5">
            {Object.entries(grouped).map(([movieName, times]) => (
              <div key={movieName}>
                <h4 className="text-sm font-bold text-gray-900 mb-2">{movieName}</h4>
                <div className="flex flex-wrap gap-2">
                  {times
                    .sort((a, b) => a.startTime.localeCompare(b.startTime))
                    .map((t, i) => {
                      const soldOut = t.remainingSeats === 0;
                      return (
                        <div
                          key={i}
                          className={`px-3 py-2 rounded-lg border text-center min-w-[80px] ${
                            soldOut
                              ? 'border-gray-200 bg-gray-50 opacity-50'
                              : 'border-gray-200 bg-white'
                          }`}
                        >
                          <p className="text-sm font-semibold text-gray-900">
                            {t.startTime.slice(0, 2)}:{t.startTime.slice(2) || t.startTime.slice(-2)}
                          </p>
                          {t.screenName && (
                            <p className="text-[10px] text-gray-400">{t.screenName}</p>
                          )}
                          <p
                            className={`text-xs font-medium mt-0.5 ${
                              soldOut
                                ? 'text-red-400'
                                : t.remainingSeats <= 10
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                            }`}
                          >
                            {soldOut ? '매진' : `${t.remainingSeats}석`}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
