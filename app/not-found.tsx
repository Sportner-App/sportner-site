import Link from "next/link";

import { yasalBaglantilar } from "@/lib/site";

/**
 * Statik disa aktarimda `out/404.html` olarak uretilir; GitHub Pages bulunamayan
 * adreslerde bu dosyayi sunar.
 */
export default function Bulunamadi() {
  return (
    <section className="govde flex min-h-[70svh] flex-col justify-center py-32">
      <p className="etiket">404</p>
      <h1 className="baslik mt-4 max-w-2xl text-[clamp(2.25rem,6.4vw,4rem)]">
        Bu sayfa sahada yok.
      </h1>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
        Aradığın adres taşınmış ya da hiç var olmamış olabilir.
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-4">
        <Link
          href="/"
          className="rounded-full bg-lime px-7 py-3.5 font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
        >
          Ana sayfaya dön
        </Link>
        {yasalBaglantilar.map((b) => (
          <Link
            key={b.yol}
            href={b.yol}
            className="text-[0.9375rem] text-muted underline decoration-1 underline-offset-4 transition-colors hover:text-lime"
          >
            {b.ad}
          </Link>
        ))}
      </div>
    </section>
  );
}
