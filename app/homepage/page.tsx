'use client';

import React from 'react';
import { getAllAnime, AnimeField, getAnimeLatest } from '@/service/anime';
import Movie from '@/components/movie-icon';
import { Play, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Beranda() {
  const [featuredAnime, setFeaturedAnime] = React.useState<AnimeField[]>([]);
  const [latestAnime, setLatestAnime] = React.useState<AnimeField[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingLatest, setLoadingLatest] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorLatest, setErrorLatest] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [hasMore, setHasMore] = React.useState<boolean>(true);

  const router = useRouter();

  // featured
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await getAllAnime();
        if (!mounted) return;
        setFeaturedAnime(data.featuredAnime ?? []);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? 'Gagal memuat data');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // latest
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingLatest(true);
      setErrorLatest(null);
      try {
        const data = await getAnimeLatest(page);
        if (!mounted) return;
        setLatestAnime(Array.isArray(data) ? data : []);
        setHasMore(Array.isArray(data) ? data.length > 0 : false);
      } catch (err: any) {
        if (!mounted) return;
        setErrorLatest(err?.message ?? 'Gagal memuat latest anime');
        setLatestAnime([]);
      } finally {
        if (!mounted) return;
        setLoadingLatest(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => p + 1);
  const jumpTo = (value: string) => {
    const n = Math.floor(Number(value));
    if (Number.isNaN(n) || n < 1) return;
    setPage(n);
  };

  // page window: tampilkan tombol halaman sekitar current (±2)
  const listRef = React.useRef<HTMLDivElement | null>(null);

  // fetch featured & latest sama seperti sebelumnya (tidak diulang di sini)

  // scroll to start when page changes
  React.useEffect(() => {
    if (!listRef.current) return;
    // scroll ke kiri paling pertama item pada page change
    listRef.current.scrollTo({ left: 0, behavior: 'smooth' });
  }, [page]);

  // page window helper (sama)
  const pageWindow = () => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    const start = Math.max(1, page - half);
    return Array.from({ length: windowSize }, (_, i) => start + i).filter(
      (p) => p >= 1
    );
  };

  if (loading)
    return <p className="p-4 mt-5 container mx-auto text-center">Loading...</p>;

  return (
    <main>
      {/* hero */}
      <div className="h-screen relative">
        <div className="absolute z-10 inset-0 bg-gradient-to-r from-black via-black/80 to-black/20"></div>
        <div className="absolute inset-0">
          <img
            src={featuredAnime[0]?.imageUrl}
            alt={featuredAnime[0]?.title}
            className="object-cover w-screen h-screen"
            loading="lazy"
          />
        </div>

        <div className="absolute inset-0 z-20 p-4 max-w-6xl py-10 flex flex-col justify-center mx-auto">
          <div className="flex items-center w-fit px-3 p-1 gap-2 text-xs rounded-full border border-gray-600">
            <Movie className="w-3 h-3" /> <span>Featured Anime</span>
          </div>
          <p className="mt-4 font-extrabold text-4xl">
            {featuredAnime[0]?.title}
          </p>
          <p className="mt-4 text-gray-300">{featuredAnime[0]?.description}</p>
          <div className="mt-10">
            <button className="rounded-md p-4 px-10 bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center gap-1">
              <Play className="stroke-white fill-white" />
              Tonton Anime
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center flex-col md:flex-row justify-between12">
        {/* latest anime */}
        <div className="container mx-auto p-4 pt-16 md:py-16">
          {/* header tetap di atas */}
          <div className="mb-4">
            <div className="flex items-center gap-5">
              <div className="w-2 h-7 bg-gradient-to-tr from-cyan-500 to-purple-600 border" />
              <p className="text-2xl font-bold">Latest Anime</p>
            </div>
          </div>

          {/* desktop arrows */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex gap-2">
            <button
              onClick={() => {
                if (!listRef.current) return;
                listRef.current.scrollBy({ left: -240, behavior: 'smooth' });
              }}
              className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/60"
              aria-label="Scroll left"
            >
              ‹
            </button>
            <button
              onClick={() => {
                if (!listRef.current) return;
                listRef.current.scrollBy({ left: 240, behavior: 'smooth' });
              }}
              className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/60"
              aria-label="Scroll right"
            >
              ›
            </button>
          </div>
        </div>
        {/* pagination: MOBILE -> tampil di bawah, center; DESKTOP -> tetap di samping header */}
        <div className="mb-10 md:mb-0">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* row tombol Prev / Page buttons / Next */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center gap-2">
              <button
                onClick={goPrev}
                disabled={page === 1 || loadingLatest}
                aria-disabled={page === 1}
                className={`px-3 py-1 rounded-md text-sm bg-white/5 hover:bg-white/10 transition disabled:opacity-40`}
              >
                Prev
              </button>

              {/* tampil semua tombol pageWindow pada semua ukuran */}
              {pageWindow().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={`px-3 py-1 rounded-md text-sm ${
                    p === page
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={goNext}
                disabled={loadingLatest || !hasMore}
                aria-disabled={loadingLatest || !hasMore}
                className={`px-3 py-1 rounded-md text-sm bg-white/5 hover:bg-white/10 transition disabled:opacity-40`}
              >
                Next
              </button>
            </div>

            {/* jump input kecil di bawah (mobile & desktop) */}
            <div className="mt-2 md:m-0 flex items-center gap-2">
              <input
                type="number"
                min={1}
                placeholder="Page"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const v = (e.target as HTMLInputElement).value;
                    const n = Math.floor(Number(v));
                    if (!Number.isNaN(n) && n >= 1) setPage(n);
                  }
                }}
                className="w-20 px-2 py-1 border rounded bg-transparent text-sm text-center"
              />
              <button
                onClick={() => {
                  const el = document.querySelector<HTMLInputElement>(
                    'input[placeholder="Page"]'
                  );
                  if (el) {
                    const n = Math.floor(Number(el.value));
                    if (!Number.isNaN(n) && n >= 1) setPage(n);
                  }
                }}
                className="px-3 py-1 rounded-md bg-cyan-600 text-white text-sm"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* horizontal list */}
      <div className="relative mb-16">
        <div
          ref={listRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1 scrollbar-modern"
          style={{ scrollPadding: '1rem' }}
          role="list"
          aria-label="Latest anime list"
        >
          {latestAnime.map((a, idx) => (
            <article
              key={a.id ?? `${a.title}-${idx}`}
              className="min-w-[220px] w-[220px] snap-start rounded-lg border bg-zinc-900/40 overflow-hidden shadow hover:scale-105 transition-transform"
              role="listitem"
              onClick={() =>
                router.push(
                  `/homepage/detail/${encodeURIComponent(a?.title ?? '')}?src=${encodeURIComponent(a?.detailLink ?? '')}`
                )
              }
            >
              <div className="h-40 bg-gray-800">
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm line-clamp-1">{a.title}</h4>
                <div className="mt-3 flex flex-col gap-1 justify-between">
                  <span className="text-xs text-cyan-500 lowercase">
                    {a?.status ?? '—'}
                  </span>
                  <span className="flex items-center gap-2 text-[.55rem] text-gray-300">
                    <Star className="fill-yellow-500 stroke-yellow-500 size-3" />
                    {a?.rating ?? '—'}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
