'use client';

import React from 'react';
import clsx from 'clsx';
import { useRouter } from 'next/navigation';
import { asString } from '@/lib/params';
import { getAnimeWatch } from '@/service/anime';

/* --- tipe data berdasarkan contoh payload --- */
type Source = {
  id?: string;
  src: string;
  type?: string;
  size?: string; // '720' | '480' | '360' ...
};

type VideoPayload = {
  availableQualities?: string[]; // ["720p","480p","360p"]
  sources?: Source[]; // array sumber
  totalSources?: number;
  videoElement?: {
    dataPoster?: string | null;
    src?: string | null;
    [k: string]: any;
  };
  [k: string]: any;
};

/* --- util: cari source berdasarkan quality (size or label) --- */
function findSourceForQuality(
  sources: Source[] | undefined,
  qualityLabel?: string
): Source | undefined {
  if (!sources || !qualityLabel) return undefined;
  // kualitas bisa berupa '720p' or '720' (size). coba cocokkan dengan ukuran numeric dulu
  const normalized = qualityLabel.replace(/\s|p/gi, ''); // "720p" -> "720"
  return sources.find(
    (s) =>
      (s.size && s.size.toString() === normalized) || s.id?.includes(normalized)
  );
}

/* --- komponen utama --- */
export default function PageWatch() {
  const router = useRouter();
  const param = asString(
    (typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams()
    ).get('unused') ?? ''
  );
  // NOTE: Anda sebelumnya menggunakan useParams/useSearchParams; langsung ambil src dari URL:
  const search =
    typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const raw_src = search.get('src') ?? '';
  const src = raw_src ? decodeURIComponent(raw_src) : null;

  const [payload, setPayload] = React.useState<VideoPayload | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [switching, setSwitching] = React.useState(false); // loading saat ganti kualitas
  const [error, setError] = React.useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = React.useState<string | null>(
    null
  );

  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAnimeWatch(src ?? '');
        if (!mounted) return;
        setPayload(data ?? null);

        // tentukan default quality: pilih first available quality atau deduksi dari sources
        const avail = data?.availableQualities;
        if (avail && avail.length > 0) {
          setCurrentQuality(avail[0]);
        } else if (data?.sources && data.sources.length > 0) {
          // gunakan largest size jika tersedia
          const sorted = [...data.sources].sort(
            (a, b) => Number(b.size ?? 0) - Number(a.size ?? 0)
          );
          setCurrentQuality(sorted[0]?.size ? `${sorted[0].size}p` : null);
        } else {
          setCurrentQuality(null);
        }
      } catch (err: any) {
        setError(err?.message ?? 'Gagal memuat video');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [src]);

  /* ganti quality: set src video dan beri sedikit loading state */
  const handleQualityChange = async (q: string) => {
    if (!payload?.sources) return;
    const srcItem = findSourceForQuality(payload.sources, q);
    if (!srcItem) return;
    setSwitching(true);
    setCurrentQuality(q);

    // swap source: gunakan videoRef dan set src lalu load()
    try {
      if (videoRef.current) {
        videoRef.current.pause();
        // set attribute src lalu load() dan play() jika ingin auto-play
        videoRef.current.src = srcItem.src;
        await videoRef.current.load();
        // optional: auto play after switching if previously playing
        // videoRef.current.play().catch(() => {});
      }
    } finally {
      // beri sedikit delay agar UI tak langsung berkedip
      setTimeout(() => setSwitching(false), 250);
    }
  };

  /* helper saat mount video element untuk inisialisasi src */
  React.useEffect(() => {
    if (!payload || !videoRef.current) return;
    const srcItem = findSourceForQuality(payload.sources, currentQuality ?? '');
    if (srcItem && videoRef.current.src !== srcItem.src) {
      videoRef.current.src = srcItem.src;
      // jangan panggil load() di SSR; di client aman
      try {
        videoRef.current.load();
      } catch {}
    }
  }, [payload, currentQuality]);

  /* --- UI --- */
  return (
    <main className="p-4 max-w-5xl mx-auto">
      {/* breadcrumbs simple */}
      <div className="mb-4 text-sm text-gray-300">
        <button onClick={() => router.back()} className="underline">
          Back
        </button>{' '}
        / Watch
      </div>

      {/* skeleton saat loading */}
      {loading ? (
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-800 rounded-md w-full h-[420px]" />
          <div className="flex gap-4">
            <div className="bg-gray-800 h-10 w-40 rounded" />
            <div className="bg-gray-800 h-10 w-24 rounded" />
            <div className="bg-gray-800 h-10 w-24 rounded" />
          </div>
          <div className="bg-gray-800 h-6 w-3/4 rounded" />
          <div className="bg-gray-800 h-6 w-1/2 rounded" />
        </div>
      ) : error ? (
        <div className="p-6 bg-red-900 text-white rounded">{error}</div>
      ) : (
        <div className="grid gap-4">
          {/* video container */}
          <div className="bg-black rounded overflow-hidden shadow">
            <div className="relative aspect-video bg-black">
              {/* video element */}
              <video
                ref={videoRef}
                controls
                playsInline
                preload="metadata"
                poster={payload?.videoElement?.dataPoster ?? undefined}
                className="w-full h-full object-cover"
                controlsList="nodownload"
                crossOrigin="anonymous"
              >
                {/* fallback text */}
                Your browser does not support the video tag.
              </video>

              {/* overlay loading saat switching quality */}
              {switching && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <div className="text-white text-sm">Switching quality...</div>
                </div>
              )}
            </div>
          </div>

          {/* controls: quality selector + source list */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Quality</span>
              <div className="flex gap-2">
                {payload?.availableQualities?.map((q) => {
                  const active = currentQuality === q;
                  return (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={clsx(
                        'px-3 py-1 rounded text-sm focus:outline-none',
                        active
                          ? 'bg-white text-black'
                          : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                      )}
                      aria-pressed={active}
                    >
                      {q}
                    </button>
                  );
                }) ?? (
                  <span className="text-xs text-gray-500">No qualities</span>
                )}
              </div>
            </div>

            {/* optional: tampilkan daftar sources / download (non-downloadable disabled) */}
            <div className="ml-auto text-sm text-gray-300">
              <span className="mr-2">Sources:</span>
              {payload?.sources?.map((s) => (
                <span key={s.id ?? s.src} className="mr-2">
                  <button
                    onClick={() => {
                      // langsung set currentQuality berdasarkan size jika tersedia
                      const label = s.size ? `${s.size}p` : s.id ?? s.src;
                      handleQualityChange(label);
                    }}
                    className="text-xs underline"
                  >
                    {s.size ? `${s.size}p` : 'src'}
                  </button>
                </span>
              )) ?? <span className="text-xs text-gray-500">-</span>}
            </div>
          </div>

          {/* meta: poster, total sources, etc. */}
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <img
                src={payload?.videoElement?.dataPoster ?? '/favicon.ico'}
                alt="poster"
                className="w-12 h-8 object-cover rounded"
              />
              <div>
                <div className="text-white text-sm">Player</div>
                <div className="text-xs">
                  {payload?.totalSources ?? payload?.sources?.length ?? '-'}{' '}
                  sources
                </div>
              </div>
            </div>

            <div className="hidden sm:block text-xs text-gray-500">
              Controls: use native player controls for seek/play/pause
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
