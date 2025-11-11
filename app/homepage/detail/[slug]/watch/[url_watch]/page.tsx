'use client';

import React from 'react';
import clsx from 'clsx';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { getAnimeWatch } from '@/service/anime';
import { asString } from '@/lib/params';

type Source = { id?: string; src: string; type?: string; size?: string };
type VideoPayload = {
  availableQualities?: string[];
  sources?: Source[];
  totalSources?: number;
  videoElement?: { dataPoster?: string | null; src?: string | null; [k: string]: any };
  title?: string;
  posterText?: string;
  [k: string]: any;
};

function findSourceForQuality(sources: Source[] | undefined, qualityLabel?: string): Source | undefined {
  if (!sources || !qualityLabel) return undefined;
  const normalized = qualityLabel.replace(/\s|p/gi, '').trim();
  return sources.find(s => (s.size && s.size.toString() === normalized) || s.id?.includes(normalized) || s.src.includes(normalized));
}

export default function PageWatch() {
  const router = useRouter();
  const raw_title = useParams();
  const raw_title_ = asString(raw_title.slug ?? '')
  const title = decodeURIComponent(raw_title_);
  const searchParams = useSearchParams();

  const rawSrc = searchParams?.get('src') ?? '';
  const src = rawSrc ? decodeURIComponent(rawSrc) : null;

  const [payload, setPayload] = React.useState<VideoPayload | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [switching, setSwitching] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentQuality, setCurrentQuality] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const lastFetchedSrcRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!src) {
      setPayload(null);
      setError(null);
      setCurrentQuality(null);
      return;
    }
    if (lastFetchedSrcRef.current === src) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = (await getAnimeWatch(src)) as VideoPayload | null;
        if (!mounted) return;
        setPayload(data ?? null);
        lastFetchedSrcRef.current = src;

        const avail = data?.availableQualities;
        if (avail && avail.length > 0) setCurrentQuality(avail[0]);
        else if (data?.sources && data.sources.length > 0) {
          const sorted = [...data.sources].sort((a, b) => Number(b.size ?? 0) - Number(a.size ?? 0));
          setCurrentQuality(sorted[0]?.size ? `${sorted[0].size}p` : null);
        } else setCurrentQuality(null);
      } catch (err: any) {
        if (!mounted) return;
        setError(err?.message ?? 'Gagal memuat video');
        setPayload(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [src]);

  React.useEffect(() => {
    if (!payload || !videoRef.current) return;
    const srcItem = findSourceForQuality(payload.sources, currentQuality ?? '');
    if (!srcItem) return;
    if (videoRef.current.src === srcItem.src) return;

    try {
      const wasPlaying = !videoRef.current.paused && !videoRef.current.ended;
      videoRef.current.pause();
      videoRef.current.src = srcItem.src;
      videoRef.current.load();
      if (wasPlaying) videoRef.current.play().catch(() => {});
    } catch (e) {
      // ignore
    }
    setSwitching(true);
    const t = setTimeout(() => setSwitching(false), 300);
    return () => clearTimeout(t);
  }, [payload, currentQuality]);

  const handleQualityChange = (q: string) => {
    if (!payload?.sources) return;
    const found = findSourceForQuality(payload.sources, q);
    if (!found) return;
    setCurrentQuality(q);
  };

  if (!src) {
    return (
      <main className="h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-black to-slate-900 p-6">
        <div className="max-w-2xl w-full text-center bg-gray-800/40 backdrop-blur-sm rounded-xl p-8">
          <button onClick={() => router.back()} className="text-sm underline text-gray-300 mb-4 inline-block">Back</button>
          <h2 className="text-xl font-semibold text-white mb-2">No video source</h2>
          <p className="text-sm text-gray-400">Query string <code className="px-1 bg-gray-700 rounded">src</code> tidak ditemukan.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="h-screen grid grid-rows-[auto_1fr] bg-gradient-to-br from-slate-900 via-black to-gray-900 text-white">
      {/* Top bar */}
      <header className="px-6 py-3 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="text-sm text-gray-300 hover:text-white transition">Back</button>
          <div className="ml-2 text-sm text-gray-300">/ Watch</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400">Sources: <span className="text-sm text-gray-200">{payload?.totalSources ?? payload?.sources?.length ?? '-'}</span></div>
          <div className="text-xs text-gray-400">Quality: <span className="text-sm text-gray-200">{currentQuality ?? '-'}</span></div>
        </div>
      </header>

      {/* Content */}
      <div className="h-full grid lg:grid-cols-[1fr_420px] gap-6 px-6 py-6">
        {/* Left: video area */}
        <section className="relative rounded-xl overflow-hidden bg-black shadow-xl flex items-center justify-center">
          {/* Poster / overlay */}
          <div className="bg-gradient-to-t from-black/70 via-transparent to-black/60 pointer-events-none" />

          {/* video container with glass controls wrapper */}
          <div className="w-full h-full flex items-center justify-center">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-pulse w-full h-full bg-gradient-to-br from-gray-800 to-gray-700" />
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <h3 className="text-lg font-semibold text-red-400">Error</h3>
                <p className="text-sm text-gray-300 mt-2">{error}</p>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col">
                <div className="flex-1 relative">
                  <video
                    ref={videoRef}
                    controls
                    playsInline
                    preload="metadata"
                    poster={payload?.videoElement?.dataPoster ?? undefined}
                    className="w-full h-full object-contain bg-black"
                    controlsList="nodownload"
                    crossOrigin="anonymous"
                  />
                  {switching && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                      <div className="text-white text-sm px-4 py-2 bg-black/40 rounded-xl backdrop-blur-sm">Switching quality...</div>
                    </div>
                  )}
                </div>

                {/* subtle bottom info */}
               
              </div>
            )}
          </div>
        </section>

        {/* Right: control panel */}
        <aside className="h-full rounded-xl p-6 bg-gradient-to-tr from-white/3 to-white/6 backdrop-blur-sm border border-white/6 shadow-inner flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0 bg-gray-800">
              {payload?.videoElement?.dataPoster ? (
                <img src={payload.videoElement.dataPoster} alt="poster" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">POSTER</div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold leading-tight">{title ?? 'Untitled'}</h1>
              <p className="text-sm text-gray-300 mt-1">High quality viewing experience. Use quality selector to switch streams.</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="px-3 py-1 rounded-full bg-gradient-to-r from-purple-500 to-cyan-400 text-black text-xs font-semibold">Premium</div>
                <div className="text-xs text-gray-400">• {payload?.totalSources ?? payload?.sources?.length ?? '—'} sources</div>
              </div>
            </div>
          </div>

          {/* Quality selector */}
          <div>
            <label className="block text-xs text-gray-300 mb-2">Select Quality</label>
            <div className="flex flex-wrap gap-2">
              {payload?.availableQualities?.length ? (
                payload.availableQualities.map((q) => {
                  const active = currentQuality === q;
                  return (
                    <button
                      key={q}
                      onClick={() => handleQualityChange(q)}
                      className={clsx(
                        'px-3 py-2 rounded-lg text-sm font-medium transition-shadow',
                        active
                          ? 'bg-white text-black shadow-lg transform scale-105'
                          : 'bg-black/40 text-gray-200 hover:bg-black/50'
                      )}
                      aria-pressed={active}
                    >
                      {q}
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-gray-400">No qualities available</div>
              )}
            </div>
          </div>

          {/* Source list */}
          <div>
            <label className="block text-xs text-gray-300 mb-2">Sources</label>
            <div className="flex flex-col gap-2 max-h-40 overflow-auto pr-2">
              {payload?.sources?.length ? (
                payload.sources.map((s) => {
                  const label = s.size ? `${s.size}p` : s.id ?? s.src;
                  const active = currentQuality === label || (currentQuality && label.includes(currentQuality.replace('p', '')));
                  return (
                    <button
                      key={s.id ?? s.src}
                      onClick={() => handleQualityChange(label)}
                      className={clsx(
                        'text-left px-3 py-2 rounded-md text-sm transition-colors',
                        active ? 'bg-white text-black shadow-md' : 'bg-black/30 text-gray-200 hover:bg-black/40'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="truncate">{label}</div>
                        <div className="text-xs text-gray-400">{s.type ?? 'video'}</div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-xs text-gray-400">No sources available</div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-auto flex gap-3 items-center">
            <button
              onClick={() => {
                try { videoRef.current?.play(); } catch {}
              }}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-500 rounded-lg text-black font-semibold shadow-lg"
            >
              Play
            </button>

            <button
              onClick={() => {
                try { videoRef.current?.pause(); } catch {}
              }}
              className="px-4 py-2 bg-white/5 rounded-lg text-sm text-gray-200"
            >
              Pause
            </button>

            <button
              onClick={() => {
                if (!payload?.videoElement?.dataPoster) return;
                const url = payload.videoElement.dataPoster;
                const a = document.createElement('a');
                a.href = url;
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.click();
              }}
              className="px-3 py-2 bg-black/30 rounded-lg text-xs text-gray-200 hidden sm:inline"
              title="Open poster"
            >
              Poster
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
