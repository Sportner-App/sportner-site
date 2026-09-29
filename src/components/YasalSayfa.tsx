import Link from "next/link";

import Beliren from "./Beliren";
import { icerikOku, type IcerikAdi } from "@/lib/icerik";

/**
 * content/*.md dosyalarindan uretilen metin sayfalarinin ortak kabugu.
 * Gizlilik ve destek adresleri App Store Connect'e verildi; yol degismemeli.
 */
export default async function YasalSayfa({ ad }: { ad: IcerikAdi }) {
  const { baslik, html } = await icerikOku(ad);

  return (
    <article className="relative">
      {/* Ustte hafif bir isik: sayfa basligi bos siyahta yuzmesin */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-gradient-to-b from-surface/70 to-transparent"
      />

      <div className="govde max-w-3xl! py-28 md:py-36">
        <Beliren yon="yerinde">
          <nav aria-label="İçerik yolu">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[0.9375rem] text-soft transition-colors hover:text-lime"
            >
              <span aria-hidden>←</span> Sportner
            </Link>
          </nav>
        </Beliren>

        <Beliren>
          <h1 className="baslik mt-8 text-[clamp(2.25rem,6vw,3.5rem)]">
            {baslik}
          </h1>
        </Beliren>

        <Beliren gecikme={0.08}>
          <div
            className="metin mt-10"
            // İçerik depodaki content/*.md dosyalarından geliyor; dışarıdan
            // veya kullanıcıdan gelen bir girdi değil.
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </Beliren>
      </div>
    </article>
  );
}
