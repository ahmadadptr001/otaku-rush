'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star } from 'lucide-react';
import clsx from 'clsx';
import { searchAnime } from '@/service/anime'; // aktifkan API pencarian

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // debounce pencarian
  React.useEffect(() => {
    const delay = setTimeout(() => {
      if (!query.trim()) {
        setResults([]);
        setError(null);
        return;
      }

      (async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await searchAnime(query);
          setResults(data ?? []);
          if (data.length === 0) setError('Tidak ditemukan hasil.');
        } catch (err: any) {
          setError(err?.message ?? 'Gagal memuat hasil.');
          setResults([]);
        } finally {
          setLoading(false);
        }
      })();
    }, 500);

    return () => clearTimeout(delay);
  }, [query]);

  const openDetail = (item: any) => {
    const title = encodeURIComponent(item.title ?? 'unknown');
    const src = encodeURIComponent(item.detailLink ?? '');
    router.push(`/homepage/detail/${title}?src=${src}`);
  };

  return (
    <main className="min-h-screen bg-black text-white px-4 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Cari Anime</h1>

        <div className="relative mb-8">
          <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan judul anime..."
            className="w-full bg-gray-900 text-white rounded-md py-3 pl-10 pr-4 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-gray-800 rounded-md h-60"
              />
            ))}
          </div>
        ) : error ? (
          <div className="text-center text-gray-400 mt-10">{error}</div>
        ) : results.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            Ketik sesuatu untuk mencari anime.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {results.map((item, idx) => (
              <div
                key={item.id ?? idx}
                className="bg-gray-900 rounded-md overflow-hidden shadow hover:scale-[1.02] transition cursor-pointer"
                onClick={() => openDetail(item)}
              >
                <div className="h-40 bg-gray-800">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-400">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                    <span>{item.type ?? '-'}</span>
                    <span className="flex items-center gap-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-yellow-400" />
                      {item.rating ?? '-'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
