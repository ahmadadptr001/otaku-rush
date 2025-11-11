'use client';

import Play from '@/components/play-icon';
import { asString } from '@/lib/params';
import { getAnimeDetail } from '@/service/anime';
import { ChevronRight, Star } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React from 'react';

/* tipe minimal untuk safety */
export interface Episode {
  title?: string;
  url?: string;
  [k: string]: any;
}

export interface AnimeField {
  id?: string;
  title?: string;
  imageUrl?: string;
  synopsis?: string;
  score?: number | string;
  members?: number | string;
  status?: string;
  type?: string;
  genres?: string[];
  episodesList?: Episode[];
  [k: string]: any;
}

export default function PageDetailSlug() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const rawTitle = asString(params?.slug);
  const rawSrc = searchParams?.get('src') ?? '';

  const title_anime = rawTitle ? decodeURIComponent(rawTitle) : '';
  const src = rawSrc ? decodeURIComponent(rawSrc) : null;

  const [anime, setAnime] = React.useState<AnimeField | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  /* fetch ulang ketika src berubah */
  React.useEffect(() => {
    if (!src) {
      setAnime(null);
      setError(null);
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnimeDetail(src);
        if (!mounted) return;
        // normalisasi: jika API mengembalikan array => ambil pertama, jika object => cast
        let normalized: AnimeField | null = null;
        if (!data) normalized = null;
        else if (Array.isArray(data))
          normalized = (data[0] ?? null) as AnimeField | null;
        else normalized = data as AnimeField;
        setAnime(normalized);
      } catch (err: any) {
        if (!mounted) return;
        console.error(err);
        setError(err?.message ?? 'Gagal memuat detail anime');
        setAnime(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [src]);

  /* navigasi ke page watch untuk episode tertentu */
  const goToEpisode = (ep: Episode | null | undefined) => {
    if (!ep?.url) return;
    const encodedTitle = encodeURIComponent(anime?.title ?? title_anime ?? '');
    const epTitle = encodeURIComponent(ep.title ?? '');
    const epSrc = encodeURIComponent(ep.url ?? '');
    router.push(
      `/homepage/detail/${encodedTitle}/watch/${epTitle}?src=${epSrc}`
    );
  };

  /* Watch Now -> episode pertama (fallback: langsung ke src dari query jika episodesList kosong) */
  const handleWatchNow = () => {
    const firstEp = anime?.episodesList?.[0];
    if (firstEp && firstEp.url) {
      goToEpisode(firstEp);
      return;
    }
    // fallback: jika tidak ada episode list tapi src tersedia, buka langsung player dengan src current
    if (src) {
      const encodedTitle = encodeURIComponent(
        anime?.title ?? title_anime ?? ''
      );
      const epTitle = encodeURIComponent('episode-1');
      const epSrc = encodeURIComponent(src);
      router.push(
        `/homepage/detail/${encodedTitle}/watch/${epTitle}?src=${epSrc}`
      );
    }
  };

  return (
    <main className="container p-4 mx-auto mt-6">
      <section>
        <p className="flex items-center gap-2 text-xs text-gray-300 container">
          <span>Home</span> {'>'} <span>Anime</span> {'>'}{' '}
          <span className="text-white line-clamp-1">{title_anime}</span>
        </p>
      </section>

      {loading && (
        <div className="mt-6">
          <div className="animate-pulse bg-gray-800 h-72 w-full rounded-md" />
          <div className="mt-3 space-y-2">
            <div className="animate-pulse bg-gray-800 h-5 w-3/4 rounded" />
            <div className="animate-pulse bg-gray-800 h-4 w-1/2 rounded" />
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-900 text-white rounded">{error}</div>
      )}

      {!loading && !error && (
        <div className="gap-5 flex flex-col lg:flex-row mt-5">
          <section className="rounded-md shadow-md/20 flex justify-center min-w-[300px]">
            <div className="bg-gray-900 w-fit p-4">
              {anime?.imageUrl ? (
                <img
                  src={anime.imageUrl}
                  alt={anime.title}
                  loading="lazy"
                  className="mx-auto h-[350px] object-cover"
                />
              ) : (
                <div className="mx-auto h-[350px] w-[250px] bg-gray-800 flex items-center justify-center text-sm text-gray-400">
                  Tidak ada gambar
                </div>
              )}

              <p className="text-yellow-500 flex items-center gap-1 justify-center mt-2">
                <Star className="w-5 fill-yellow-500" />
                {anime?.score ?? '-'}
              </p>
              <p className="text-center text-xs text-gray-300">
                {anime?.members ?? '-'} {'('}members{')'}
              </p>
              <button
                onClick={handleWatchNow}
                className="p-3 px-5 w-full text-base bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-md mt-3"
              >
                Watch Now
              </button>
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <div className="p-4 rounded-md shadow-md/20 bg-gray-900">
              <h3 className="text-2xl font-bold">
                {anime?.title ?? title_anime}
              </h3>
              <div className="flex flex-wrap items-center gap-2 my-3">
                {anime?.status && (
                  <span className="rounded-full p-1 px-3 bg-green-500/20">
                    {anime.status}
                  </span>
                )}
                {anime?.type && (
                  <span className="rounded-full p-1 px-3 bg-gray-500/20">
                    {anime.type}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {Array.isArray(anime?.genres) &&
                  anime!.genres!.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full p-1 px-3 bg-blue-500/20"
                    >
                      {genre}
                    </span>
                  ))}
              </div>
            </div>

            <div className="p-4 rounded-md shadow-md/20 bg-gray-900">
              <h3 className="text-2xl font-bold">Sinopsis:</h3>
              <p className="text-gray-400 text-xs mt-1">
                {anime?.synopsis ?? 'Deskripsi tidak tersedia.'}
              </p>
            </div>

            {/* daftar episode */}
            <div className="grid grid-cols-2 lg:grid-cols-3 mt-2 gap-2">
              {Array.isArray(anime?.episodesList) &&
              anime!.episodesList!.length > 0 ? (
                anime!.episodesList!.map((episode: Episode, i: number) => (
                  <div
                    key={episode?.url ?? `${i}`}
                    className="flex items-center gap-2 bg-gray-500/20 p-3 rounded-md cursor-pointer"
                    onClick={() => goToEpisode(episode)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        goToEpisode(episode);
                    }}
                  >
                    <Play className="stroke-0" /> <span>Episode {i + 1}</span>
                    <ChevronRight className="ms-auto" />
                  </div>
                ))
              ) : (
                <div className="col-span-full p-4 text-center text-sm text-gray-400">
                  Episode tidak tersedia.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
