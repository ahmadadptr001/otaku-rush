'use client';
import Link from 'next/link';
import { Button } from './ui/button';

export function Hero() {
  return (
    <div className="relative w-full h-screen bg-[#090909] text-white">
      <picture className="h-screen">
        <source
          srcSet="https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet.webp 1x, https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet@2x.webp 2x, https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet@3x.webp 3x"
          type="image/webp"
        ></source>
        <img
          src="https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet.webp 1x, https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet@2x.webp 2x, https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet@3x.webp 3x"
          alt="hero"
          loading="lazy"
          className="object-cover h-full"
        />
      </picture>
      <div className="absolute inset-0 z-10 grid place-items-center">
        <div className="text-center max-w-xl p-7 flex flex-col gap-10">
          <h3 className="font-extrabold text-4xl">
            Nonton anime favoritmu kapan saja, di mana saja
          </h3>
          <p className="text-gray-300">
            Streaming ribuan episode dan film anime berkualitas HD — dari klasik
            hingga rilisan terbaru
          </p>
          <Link href={`/beranda`}>
            <Button className="bg-white hover:bg-gray-200 text-black rounded-full mt-5 w-fit mx-auto text-lg p-8 font-bold animate-bounce">
              Nonton Gratis
            </Button>
          </Link>
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20 z-0"></div>
    </div>
  );
}
