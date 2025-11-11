'use client';

import Play from '@/components/play-icon';
import { asString } from '@/lib/params';
import { getAnimeDetail } from '@/service/anime';
import { ChevronRight, Star } from 'lucide-react';
import { useParams, useSearchParams } from 'next/navigation';
import React from 'react';

export default function PageDetailSlug() {
  const param = useParams();
  const paramSearch = useSearchParams();
  const raw_title_anime = asString(param?.slug ?? '');
  const raw_src = paramSearch?.get('src') ?? '';

  const title_anime = decodeURIComponent(raw_title_anime) ?? '';
  const src = raw_src ? decodeURIComponent(raw_src) : null;

  const [anime, setAnime] = React.useState<object | any>(null);

  React.useEffect(() => {
    (async () => {
      const data = await getAnimeDetail(src ?? '');
      console.log(data);
      setAnime(data);
    })();
  }, []);

  const handleWatch =() => {

  }

  return (
    <main className="container p-4 mx-auto mt-6">
      {/* breadcrumbs */}
      <section>
        <p className="flex items-center gap-2 text-xs text-gray-300 container">
          <span>Home</span> {'>'} <span>Anime</span> {'>'}{' '}
          <span className="text-white line-clamp-1">{title_anime}</span>
        </p>
      </section>

      <div className="gap-5 flex flex-col lg:flex-row mt-5">
        <section className="rounded-md shadow-md/20 flex justify-center min-w-[300px]">
          <div className="bg-gray-900 w-fit p-4">
            <img
              src={anime?.imageUrl}
              alt={anime?.title}
              loading="lazy"
              className="mx-auto h-[350px] object-cover"
            />

            <p className="text-yellow-500 flex items-center gap-1 justify-center mt-2">
              <Star className="w-5 fill-yellow-500" />
              {anime?.score}
            </p>
            <p className="text-center text-xs text-gray-300">
              {anime?.members} {'('}members{')'}
            </p>
            <button className="p-3 px-5 w-full text-base bg-gradient-to-tr from-purple-600 to-cyan-500 rounded-md mt-3">
              Watch Now
            </button>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="p-4 rounded-md shadow-md/20 bg-gray-900">
            <h3 className="text-2xl font-bold">{anime?.title}</h3>
            <div className="flex flex-wrap items-center gap-2 my-3">
              <span className="rounded-full p-1 px-3 bg-green-500/20">
                {anime?.status}
              </span>
              <span className="rounded-full p-1 px-3 bg-gray-500/20">
                {anime?.type}
              </span>
            </div>
            {anime?.genres.map((genre: string) => (
              <span
                key={genre}
                className="rounded-full p-1 px-3 bg-blue-500/20"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="p-4 rounded-md shadow-md/20 bg-gray-900">
            <h3 className="text-2xl font-bold">Sinopsis:</h3>
            <p className="text-gray-400 text-xs mt-1">{anime?.synopsis}</p>
          </div>

          {/* daftar episode */}
          <div className="grid grid-cols-2 lg:grid-cols-3 mt-2 gap-2">
            {anime?.episodesList.map((episode: object, i: number) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-gray-500/20 p-3 rounded-md cursor-pointer"
                onClick={handleWatch}
              >
                <Play className="stroke-0" /> <span>Episode {i + 1}</span>
                <ChevronRight className="ms-auto" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
