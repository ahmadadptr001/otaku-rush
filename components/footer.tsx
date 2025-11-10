export default function Footer() {
  return (
    <footer className="relative w-full flex border-t items-center justify-center  mx-auto text-center text-xs gap-8 py-16">
      <div className="absolute inset-0 z-20 grid place-items-center">
        <p>
          build by {' '}
          <a
            href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            OTAKU
            <span className="bg-gradient-to-r from-purple-600 to-cyan-500 text-[13px] bg-clip-text text-transparent font-extrabold">
              RUSH
            </span>
          </a>
          {' '}team
        </p>
      </div>
      <picture className="absolute inset-0 h-32 -z-2 bg-gradient-to-r from-black via-gray-950 to-transparent">
        <source
          srcSet="https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet.webp 1x, https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet@2x.webp 2x, https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet@3x.webp 3x"
          type="image/webp"
        ></source>
        <img
          src="https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet.webp 1x, https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet@2x.webp 2x, https://static.crunchyroll.com/cr-acquisition/assets/img/start/hero/us-global/background-tablet@3x.webp 3x"
          alt="hero"
          className="object-cover w-screen h-full opacity-10"
        />
      </picture>
    </footer>
  );
}
