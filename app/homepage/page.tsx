'use client';

import React from 'react';
import { getAllAnime, getAnimeLatest, AnimeField } from '@/service/anime';
import Movie from '@/components/movie-icon';
import { MonitorUp, Play, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';
import { filterAnimeLink } from '@/lib/link';

/* Small reusable skeleton */
function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-gray-800 rounded-md overflow-hidden',
        className
      )}
    >
      <div className="h-40 bg-gradient-to-br from-gray-700 to-gray-600" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 bg-gray-700 rounded" />
        <div className="h-3 w-1/2 bg-gray-700 rounded" />
      </div>
    </div>
  );
}

export default function Beranda() {
  const router = useRouter();

  const [featuredAnime, setFeaturedAnime] = React.useState<AnimeField[]>([]);
  const [ongoingAnime, setOngoingAnime] = React.useState<AnimeField[]>([]);
  const [movieAnime, setMovieAnime] = React.useState<AnimeField[]>([]);
  const [latestAnime, setLatestAnime] = React.useState<AnimeField[]>([]);

  const [loadingFeatured, setLoadingFeatured] = React.useState<boolean>(false);
  const [loadingLatest, setLoadingLatest] = React.useState<boolean>(false);

  const [errorFeatured, setErrorFeatured] = React.useState<string | null>(null);
  const [errorLatest, setErrorLatest] = React.useState<string | null>(null);

  const [page, setPage] = React.useState<number>(1);
  const [hasMore, setHasMore] = React.useState<boolean>(true);

  const featuredRef = React.useRef<HTMLDivElement | null>(null);
  const ongoingRef = React.useRef<HTMLDivElement | null>(null);
  const movieRef = React.useRef<HTMLDivElement | null>(null);
  const latestRef = React.useRef<HTMLDivElement | null>(null);

  /* Fetch all (featured, ongoing, movies) once */
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingFeatured(true);
      setErrorFeatured(null);
      try {
        const data = await getAllAnime();
        if (!mounted) return;
        setFeaturedAnime(data.featuredAnime ?? []);
        setOngoingAnime(data.ongoingAnime ?? []);
        setMovieAnime(data.movieAnime ?? []);
      } catch (err: any) {
        if (!mounted) return;
        setErrorFeatured(err?.message ?? 'Gagal memuat featured/collections');
        setFeaturedAnime([]);
        setOngoingAnime([]);
        setMovieAnime([]);
      } finally {
        if (!mounted) return;
        setLoadingFeatured(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  /* Fetch latest (paginated) */
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingLatest(true);
      setErrorLatest(null);
      try {
        const data = await getAnimeLatest(page);
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setLatestAnime(arr);
        setHasMore(arr.length > 0);
      } catch (err: any) {
        if (!mounted) return;
        setErrorLatest(err?.message ?? 'Gagal memuat latest');
        setLatestAnime([]);
        setHasMore(false);
      } finally {
        if (!mounted) return;
        setLoadingLatest(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [page]);

  /* Pagination helpers */
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => p + 1);
  const pageWindow = () => {
    const windowSize = 5;
    const half = Math.floor(windowSize / 2);
    const start = Math.max(1, page - half);
    return Array.from({ length: windowSize }, (_, i) => start + i).filter(
      (p) => p >= 1
    );
  };

  /* Navigation helpers */
  const openDetail = (item: AnimeField) => {
    const title = encodeURIComponent(item.title ?? 'unknown');
    const src_filter = filterAnimeLink(item.detailLink ?? '');
    const src = encodeURIComponent(src_filter);
    router.replace(`/homepage/detail/${title}?src=${src}`);
  };

  const openWatch = (
    episodeUrl?: string,
    epTitle?: string,
    animeTitle?: string
  ) => {
    if (!episodeUrl) return;
    const aTitle = encodeURIComponent(animeTitle ?? 'episode');
    const eTitle = encodeURIComponent(epTitle ?? 'episode');
    const q = encodeURIComponent(episodeUrl);
    router.push(`/homepage/detail/${aTitle}/watch/${eTitle}?src=${q}`);
  };

  /* Hero play: play first episode of first featured anime */
  const heroPlay = () => {
    const first = featuredAnime[0];
    if (!first) return;
    const ep = first.episodesList?.[0];
    if (ep && (ep as any).url) {
      // episodesList items might be typed loosely; cast to any to access .url
      openWatch((ep as any).url, (ep as any).title, first.title);
    } else if (first.detailLink) {
      openDetail(first);
    }
  };

  /* render horizontal list helper */
  function renderList(list: AnimeField[]) {
    return list.length === 0
      ? Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} className="min-w-[220px]" />
        ))
      : list.map((a, idx) => (
          <article
            key={a.id ?? `${a.title ?? 'item'}-${idx}`}
            className="min-w-[220px] w-[220px] snap-start rounded-lg border bg-zinc-900/40 overflow-hidden shadow hover:scale-105 transition-transform cursor-pointer"
            onClick={() => openDetail(a)}
          >
            <div className="h-40 bg-gray-800">
              {a.imageUrl ? (
                <img
                  src={a.imageUrl}
                  alt={a.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-sm">
                  No image
                </div>
              )}
            </div>
            <div className="p-3">
              <h4 className="font-medium text-sm line-clamp-1">{a.title}</h4>
              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-cyan-500 lowercase">
                  {a?.status ?? '—'}
                </div>
                <div className="flex items-center gap-2 text-[.65rem] text-gray-300">
                  <Star className="fill-yellow-500 stroke-yellow-500 w-3 h-3" />
                  {a?.rating ?? a?.score ?? '—'}
                </div>
              </div>
            </div>
          </article>
        ));
  }

  return (
    <main>
      {/* hero */}
      <div className="h-screen relative">
        <div className="absolute z-10 inset-0 bg-gradient-to-r from-black via-black/80 to-black/20"></div>
        <div className="absolute inset-0">
          <img
            src={featuredAnime[0]?.imageUrl ?? '/placeholder-hero.jpg'}
            alt={featuredAnime[0]?.title ?? 'Featured'}
            className="object-cover w-screen h-screen"
            loading="lazy"
          />
        </div>

        <div className="absolute inset-0 z-20 p-4 max-w-6xl py-10 flex flex-col justify-center mx-auto">
          <div className="flex items-center w-fit px-3 p-1 gap-2 text-xs rounded-full border border-gray-600">
            <Movie className="w-3 h-3" /> <span>Featured Anime</span>
          </div>
          <p className="mt-4 font-extrabold text-4xl">
            {featuredAnime[0]?.title ?? '—'}
          </p>
          <p className="mt-4 text-gray-300 line-clamp-3">
            {featuredAnime[0]?.description ?? featuredAnime[0]?.synopsis ?? ''}
          </p>
          <div className="mt-10 flex gap-3">
            <button
              onClick={heroPlay}
              className="rounded-md p-4 px-8 bg-gradient-to-r from-cyan-500 to-purple-600 flex items-center gap-2 shadow-lg"
            >
              <Play className="stroke-white fill-white w-5 h-5" />
              Tonton Anime
            </button>
          </div>
        </div>
      </div>

      {/* Collections header + controls (Latest controls reused) */}
      <div className="container mx-auto p-4 pt-8 md:py-12 flex flex-col gap-6">
        {/* Latest Header + Pagination */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center justify-between">
          <div>
            <div className="flex items-center gap-5">
              <div className="w-2 h-7 bg-gradient-to-tr from-cyan-500 to-purple-600 border" />
              <p className="text-2xl font-bold">Latest Anime</p>
            </div>
          </div>

          <div className="flex px-3 items-center gap-3">
            <div className="hidden md:flex gap-2">
              <button
                onClick={() =>
                  latestRef.current?.scrollBy({
                    left: -240,
                    behavior: 'smooth',
                  })
                }
                className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/60"
                aria-label="Scroll left"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  latestRef.current?.scrollBy({ left: 240, behavior: 'smooth' })
                }
                className="p-2 rounded-full bg-black/50 text-white/80 hover:bg-black/60"
                aria-label="Scroll right"
              >
                ›
              </button>
            </div>

            <div className="flex flex-wrap md:flex-nowrap items-center gap-2">
              <button
                onClick={goPrev}
                disabled={page === 1 || loadingLatest}
                className={clsx(
                  'px-3 py-1 rounded-md text-sm',
                  page === 1 ? 'bg-gray-700 text-gray-400' : 'bg-white/5'
                )}
              >
                Prev
              </button>

              {pageWindow().map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={clsx(
                    'px-3 py-1 rounded-md text-sm',
                    p === page
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                      : 'bg-white/5'
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={goNext}
                disabled={loadingLatest || !hasMore}
                className={clsx(
                  'px-3 py-1 rounded-md text-sm',
                  !hasMore ? 'bg-gray-700 text-gray-400' : 'bg-white/5'
                )}
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Latest horizontal list */}
        <div className="relative mb-8">
          <div
            ref={latestRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1 scrollbar-modern"
            role="list"
            aria-label="Latest anime list"
            style={{ scrollPadding: '1rem' }}
          >
            {loadingLatest ? (
              Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} className="min-w-[220px]" />
              ))
            ) : errorLatest ? (
              <div className="p-4 bg-red-900 text-white rounded">
                {errorLatest}
              </div>
            ) : (
              renderList(latestAnime)
            )}
          </div>
        </div>

        {/* Ongoing */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Ongoing</h3>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() =>
                  ongoingRef.current?.scrollBy({
                    left: -240,
                    behavior: 'smooth',
                  })
                }
                className="p-2 rounded-full bg-black/50"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  ongoingRef.current?.scrollBy({
                    left: 240,
                    behavior: 'smooth',
                  })
                }
                className="p-2 rounded-full bg-black/50"
              >
                ›
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={ongoingRef}
              className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-modern"
            >
              {loadingFeatured ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} className="min-w-[220px]" />
                ))
              ) : ongoingAnime.length === 0 ? (
                <div className="text-gray-400">No ongoing anime</div>
              ) : (
                ongoingAnime.map((a, idx) => (
                  <article
                    key={a.id ?? idx}
                    className="min-w-[220px] w-[220px] cursor-pointer"
                    onClick={() => openDetail(a)}
                  >
                    <div className="h-40 bg-gray-800 overflow-hidden">
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm line-clamp-1">{a.title}</h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {a.type ?? '—'}
                        </span>
                        <div className="text-xs text-yellow-400 flex items-center gap-1">
                          <MonitorUp className="w-3 h-3" />
                          <span className="text-[.5rem]">
                            {a.quality ?? '-'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Movies */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Movies</h3>
            <div className="hidden md:flex gap-2">
              <button
                onClick={() =>
                  movieRef.current?.scrollBy({ left: -240, behavior: 'smooth' })
                }
                className="p-2 rounded-full bg-black/50"
              >
                ‹
              </button>
              <button
                onClick={() =>
                  movieRef.current?.scrollBy({ left: 240, behavior: 'smooth' })
                }
                className="p-2 rounded-full bg-black/50"
              >
                ›
              </button>
            </div>
          </div>

          <div className="relative">
            <div
              ref={movieRef}
              className="flex gap-4 overflow-x-auto py-2 px-1 scrollbar-modern"
            >
              {loadingFeatured ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <CardSkeleton key={i} className="min-w-[220px]" />
                ))
              ) : movieAnime.length === 0 ? (
                <div className="text-gray-400">No movies</div>
              ) : (
                movieAnime.map((a, idx) => (
                  <article
                    key={a.id ?? idx}
                    className="min-w-[220px] w-[220px] cursor-pointer"
                    onClick={() => openDetail(a)}
                  >
                    <div className="h-40 bg-gray-800 overflow-hidden">
                      <img
                        src={a.imageUrl}
                        alt={a.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm line-clamp-1">{a.title}</h4>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-xs text-gray-400">
                          {a.type ?? '—'}
                        </span>
                        <div className="text-xs text-yellow-400 flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {a.score ?? '-'}
                        </div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
