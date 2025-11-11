// src/service/anime.ts
import axios from 'axios';

export type AnimeField = {
  id?: string;
  title?: string;
  imageUrl?: string;
  rating?: string;
  type?: string;
  quality?: string;
  status?: string;
  detailLink?: string;
  episodeInfo?: string;
  description?: string;
  synopsis?: string;
  score?: string;
  member?: string;
  ratingInfo?: string;
  releaseDate?: string;
  studio?: string;
  episodesList?: [title?: string, url?: string];
  genres: [string];
  availableQualities: [string];
  sources: [
    {
      id: string,
      size: string,
      src: string,
      type: string
    }
  ]
};

export type GetAllAnimeResponse = {
  featuredAnime?: AnimeField[];
  ongoingAnime?: AnimeField[];
  finishedAnime?: AnimeField[];
  movieAnime?: AnimeField[];
  videoElement?: AnimeField[];
};

export const getAllAnime = async (): Promise<GetAllAnimeResponse> => {
  const url = process.env.NEXT_PUBLIC_ANIME_URL;
  if (!url) throw new Error('NEXT_PUBLIC_ANIME_URL belum diset');

  const res = await axios.get<GetAllAnimeResponse>(url, { timeout: 10_000 });
  return res.data ?? {};
};

/**
 * getAnimeLatest
 * - Karena API Anda mengembalikan langsung array latest anime,
 *   tipe kembalian harus AnimeField[].
 */
export const getAnimeLatest = async (page: number): Promise<AnimeField[]> => {
  const base = process.env.NEXT_PUBLIC_ANIME_LATEST_URL;
  if (!base) throw new Error('NEXT_PUBLIC_ANIME_LATEST_URL belum diset');

  const url =
    base +
    (base.includes('?') ? '&' : '?') +
    'page=' +
    encodeURIComponent(String(page));
  const res = await axios.get<unknown>(url, { timeout: 10_000 });

  // Pastikan safety: jika respons adalah array, kembalikan; jika bukan, fallback ke [].
  if (Array.isArray(res.data)) {
    return res.data as AnimeField[];
  }

  // Jika API membungkus array di properti (mis. { data: [...] }), periksa itu juga
  if (
    res.data &&
    typeof res.data === 'object' &&
    Array.isArray((res.data as any).data)
  ) {
    return (res.data as any).data as AnimeField[];
  }

  // fallback aman
  return [];
};

export const getAnimeDetail = async (
  link: string
): Promise<AnimeField | null> => {
  const url = process.env.NEXT_PUBLIC_ANIME_DETAIL_URL + link;
  if (!url) throw new Error('NEXT_PUBLIC_ANIME_DETAIL_URL belum diset');

  const res = await axios.get<unknown>(url, { timeout: 10_000 });
  // jika API mengembalikan object detail
  if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
    return res.data as AnimeField;
  }

  // jika API mengembalikan array dan Anda ingin item pertama
  if (Array.isArray(res.data) && res.data.length > 0) {
    return res.data[0] as AnimeField;
  }

  // fallback aman
  return null;
};

export const getAnimeWatch = async (
  link: string
): Promise<AnimeField | null> => {
  const url = process.env.NEXT_PUBLIC_ANIME_WATCH_URL + link;
  if (!url) throw new Error('NEXT_PUBLIC_ANIME_WATCH_URL belum diset');

  const res = await axios.get<unknown>(url);
  // jika API mengembalikan object WATCH
  if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
    return res.data as AnimeField;
  }

  // jika API mengembalikan array dan Anda ingin item pertama
  if (Array.isArray(res.data) && res.data.length > 0) {
    return res.data[0] as AnimeField;
  }

  // fallback aman
  return null;
};

