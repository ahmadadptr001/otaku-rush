'use client';
import Link from 'next/link';
import { Button } from './ui/button';
import { GridScan } from './ui/react-bits/GridScan/GridScan';

export function Hero() {
  return (
    <div className="relative w-full h-[screen] bg-[#090909] text-white">
      <GridScan
        className="absolute inset-0 z-0"
        sensitivity={0.55}
        lineThickness={1}
        linesColor="#464646"
        gridScale={0.08}
        scanColor="#8e4dc2"
        scanOpacity={0.4}
        enablePost
        bloomIntensity={0.6}
        chromaticAberration={0.002}
        noiseIntensity={0.01}
      />
      <div className="absolute inset-0 grid place-items-center">
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
    </div>
  );
}
