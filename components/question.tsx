import Link from 'next/link';

export default function Question() {
  return (
    <div className="container mx-auto p-4 py-10 pb-20">
      <div className="flex flex-col gap-2 text-center">
        <h3 className="text-3xl font-extrabold">Pertanyaan</h3>
        <p>
          Kunjungi{' '}
          <Link href={`#premium-picker`} className="text-purple-600">
            Pusat Bantuan
          </Link>{' '}
          kami untuk mempelajari lebih lanjut.
        </p>
      </div>
      <p className="mt-10 text-center container mx-auto text-sm">
        *Ketersediaan perangkat dan konten berbeda-beda tergantung negara atau
        wilayah.
      </p>
    </div>
  );
}
