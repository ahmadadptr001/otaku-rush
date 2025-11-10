'use client';

import React from 'react';
import { getAllAnime, AnimeField, getAnimeLatest } from '@/service/anime';
import Movie from '@/components/movie-icon';
import { Play, Star } from 'lucide-react';

export default function Beranda() {
  const [featuredAnime, setFeaturedAnime] = React.useState<AnimeField[]>([]);
  const [latestAnime, setLatestAnime] = React.useState<AnimeField[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [loadingLatest, setLoadingLatest] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorLatest, setErrorLatest] = React.useState<string | null>(null);
  const [page, setPage] = React.useState<number>(1);
  const [hasMore, setHasMore] = React.useState<boolean>(true);

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

      {/* latest anime - HORIZONTAL */}
      <div className="container mx-auto p-4 py-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="w-2 h-7 bg-gradient-to-tr from-cyan-500 to-purple-600 border" />
            <p className="text-2xl font-bold">Latest Anime</p>
          </div>

          {/* improved pagination UI */}
          <div className="flex items-center gap-3">
            <button
              onClick={goPrev}
              disabled={page === 1 || loadingLatest}
              className="px-3 py-1 rounded-md bg-white/5 text-sm border border-white/10 hover:bg-white/10 disabled:opacity-40"
            >
              Prev
            </button>

            <div className="hidden sm:flex items-center gap-1">
              {pageWindow().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    p === page
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={loadingLatest || !hasMore}
              className="px-3 py-1 rounded-md bg-white/5 text-sm border border-white/10 hover:bg-white/10 disabled:opacity-40"
            >
              Next
            </button>

            <div className="flex items-center gap-2 ml-3">
              <input
                type="number"
                min={1}
                placeholder="Page"
                onKeyDown={(e) => {
                  if (e.key === 'Enter')
                    jumpTo((e.target as HTMLInputElement).value);
                }}
                className="w-20 px-2 py-1 border rounded bg-transparent text-sm"
              />
              <button
                onClick={() => {
                  const el = document.querySelector<HTMLInputElement>(
                    'input[placeholder="Page"]'
                  );
                  if (el) jumpTo(el.value);
                }}
                className="px-3 py-1 rounded-md bg-cyan-600 text-white text-sm"
              >
                Go
              </button>
            </div>
          </div>
        </div>

        {loadingLatest && <p className="text-center">Memuat latest...</p>}
        {errorLatest && (
          <p className="text-red-500 text-center">{errorLatest}</p>
        )}

        {/* horizontal list */}
        <div className="relative">
          <div
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1 scrollbar-hide"
            style={{ scrollPadding: '1rem' }}
          >
            {latestAnime.map((a) => (
              <article
                key={a.id ?? `${a.title}-${Math.random()}`}
                className="min-w-[220px] w-[220px] snap-start rounded-lg border bg-zinc-900/40 overflow-hidden shadow hover:scale-105 transition-transform"
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
                  <h4 className="font-medium text-sm line-clamp-1">
                    {a.title}
                  </h4>
                  <div className="mt-3 flex flex-col gap-1">
                    <span className="text-xs  lowercase text-cyan-600">
                      {a?.status ?? '-'}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className='size-3 stroke-yellow-500 fill-yellow-500'/>
                      <span className="text-[.55rem] text-gray-300">
                        {a?.rating ?? '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* optional arrows to scroll container (desktop) */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:flex gap-2">
            <button
              onClick={() => {
                const c = document.querySelector(
                  '.scrollbar-hide'
                ) as HTMLElement | null;
                if (c) c.scrollBy({ left: -240, behavior: 'smooth' });
              }}
              className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/60"
            >
              ‹
            </button>
            <button
              onClick={() => {
                const c = document.querySelector(
                  '.scrollbar-hide'
                ) as HTMLElement | null;
                if (c) c.scrollBy({ left: 240, behavior: 'smooth' });
              }}
              className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/60"
            >
              ›
            </button>
          </div>
        </div>
      </div>

      {/* tail spacing */}
      <div className="h-24" />
    </main>
  );
}
