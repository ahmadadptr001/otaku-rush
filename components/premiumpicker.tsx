'use client';
import React from 'react';
import Image from 'next/image';
import clsx from 'clsx';

type BillingPeriod = 'monthly' | 'yearly';

type Plan = {
  id: string;
  name: string;
  priceMonthly: number; // in IDR
  priceYearly?: number;
  description?: string;
  features: string[];
  badge?: string;
  recommended?: boolean;
};

const PLANS: Plan[] = [
  {
    id: 'fan',
    name: 'Fan',
    priceMonthly: 29000,
    description:
      'Tanpa iklan, akses penuh ke perpustakaan, episode baru segera setelah tayang di Jepang.',
    features: [
      'Tanpa iklan',
      'Akses lengkap ke perpustakaan',
      'Episode baru segera setelah tayang di Jepang',
    ],
  },
  {
    id: 'mega-fan',
    name: 'Mega Fan',
    priceMonthly: 39000,
    description:
      'Paling Populer — streaming multi-perangkat, unduh, dan akses Game Vault.',
    features: [
      'Tanpa iklan; semua konten',
      'Streaming di 4 perangkat sekaligus',
      'Unduh video HD',
      'Akses ke Game Vault',
    ],
    badge: 'Paling Populer',
    recommended: true,
  },
];

function formatIDR(value: number) {
  return (
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value) + '/bln'
  );
}

export default function PremiumPicker({
  className,
  plans = PLANS,
}: {
  className?: string;
  plans?: Plan[];
}) {
  const [period, setPeriod] = React.useState<BillingPeriod>('monthly');

  function togglePeriod() {
    setPeriod((p) => (p === 'monthly' ? 'yearly' : 'monthly'));
  }

  return (
    <section id='premium-picker' className={clsx('w-full max-w-5xl mx-auto px-5 py-12', className)}>
      <div className="flex flex-col items-center text-center gap-6">
        <h2 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-cyan-300 bg-clip-text text-transparent">
          Pilih Premium Anda
        </h2>

        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-400">Bulanan</span>

          <button
            aria-pressed={period === 'yearly'}
            onClick={togglePeriod}
            className="relative inline-flex items-center rounded-full bg-zinc-800 p-1"
            aria-label="Toggle periode penagihan"
          >
            <span
              className={clsx(
                'w-14 h-7 flex items-center rounded-full transition-all',
                period === 'monthly'
                  ? 'bg-zinc-700 justify-start'
                  : 'bg-purple-600 justify-end'
              )}
            >
              <span
                className={clsx(
                  'w-5 h-5 bg-white rounded-full shadow transform',
                  period === 'yearly' ? '-translate-x-1' : 'translate-x-1'
                )}
                aria-hidden
              />
            </span>
          </button>

          <span className="text-sm text-zinc-400">
            Tahunan{' '}
            <span className="ml-2 inline-block text-xs font-semibold text-amber-400">
              HEMAT 16%
            </span>
          </span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan) => {
          const monthlyPrice = plan.priceMonthly;
          const displayPrice =
            period === 'monthly'
              ? formatIDR(monthlyPrice)
              : (() => {
                  const yearlyTotal = Math.round(monthlyPrice * 12 * 0.84);
                  const monthlyEquivalent = Math.round(yearlyTotal / 12);
                  return formatIDR(monthlyEquivalent);
                })();

          return (
            <article
              key={plan.id}
              className={clsx(
                'relative rounded-2xl border border-transparent p-6 bg-gradient-to-b from-zinc-900/60 to-zinc-900/40',
                plan.recommended ? 'ring-2 ring-purple-600/40' : 'shadow'
              )}
              aria-labelledby={`${plan.id}-title`}
            >
              {plan.badge && (
                <div className="absolute -top-3 right-4 inline-flex items-center rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold text-zinc-900">
                  {plan.badge}
                </div>
              )}

              <header className="mb-4 flex flex-col sm:flex-row items-center justify-between">
                <div>
                  <h3
                    id={`${plan.id}-title`}
                    className="text-xl font-bold text-white"
                  >
                    {plan.name}
                  </h3>
                  <p className="hidden sm:block mt-1 text-sm text-zinc-400">
                    {plan.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-white">
                    {displayPrice}
                  </div>
                  <div className="text-xs text-zinc-500 mt-1">
                    {period === 'monthly'
                      ? 'Ditagih per bulan'
                      : 'Ditagih per tahun'}
                  </div>
                </div>
              </header>

              <ul className="mb-6 space-y-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 00-1.414-1.414L8 11.172 4.707 7.879a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-zinc-300">{f}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  className={clsx(
                    'flex-1 rounded-md px-4 py-2 font-semibold',
                    plan.recommended
                      ? 'bg-purple-600 hover:bg-purple-500 text-white'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                  )}
                  aria-label={`Mulai Uji Coba 7 Hari Gratis untuk ${plan.name}`}
                  onClick={() => {
                    // Hook: start trial flow
                    console.log('mulai uji coba', plan.id, period);
                  }}
                >
                  Mulai Uji Coba 7 Hari Gratis
                </button>

                <button
                  className="flex-1 rounded-md border border-zinc-700 bg-transparent px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
                  aria-label={`Lewati Uji Coba Gratis dan berlangganan ${plan.name}`}
                  onClick={() => {
                    // Hook: direct subscribe
                    console.log('lewati uji coba', plan.id, period);
                  }}
                >
                  Lewati Uji Coba Gratis
                </button>
              </div>

              <p className="mt-4 text-xs text-zinc-500">
                Uji coba gratis tersedia untuk pelanggan baru dan yang memenuhi
                syarat. Paket akan otomatis diperpanjang setelah masa uji coba
                dengan harga yang tertera.
              </p>
            </article>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-zinc-500 max-w-3xl mx-auto">
        Penawaran uji coba gratis berlaku untuk pelanggan baru dan yang memenuhi
        syarat. Paket akan otomatis diperpanjang setelah masa uji coba berakhir
        dengan harga yang tercantum, kecuali dibatalkan. Anda dapat membatalkan
        kapan saja. Pembatasan dan ketentuan lain, termasuk harga, dapat
        berubah. Silakan lihat Syarat untuk detail.
      </p>
    </section>
  );
}
