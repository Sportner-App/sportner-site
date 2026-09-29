import Beliren from "./Beliren";
import { site } from "@/lib/site";

/**
 * Uygulama henuz magazalarda degil. Calismayan magaza rozeti koymak yerine
 * durum acikca yaziliyor; yayina cikinca rozetler baglantiya cevrilir.
 */
export default function Indir() {
  return (
    <section id="indir" className="relative overflow-hidden py-28 md:py-40">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 size-[44rem] max-w-none -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--color-lime), transparent 62%)",
        }}
      />

      <div className="govde text-center">
        <Beliren>
          <p className="etiket">İndir</p>
          <h2 className="baslik mx-auto mt-4 max-w-3xl text-[clamp(2.25rem,6.4vw,4.5rem)]">
            Bu hafta sonu kimlerle oynayacağını öğren.
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Sportner yakında App Store ve Google Play&apos;de. Çıktığı gün haberin
            olsun istersen bize yaz, ilk sen bil.
          </p>
        </Beliren>

        <Beliren gecikme={0.12}>
          <div className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <MagazaRozeti
              magaza="App Store"
              ustSatir="Yakında"
              simge={
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-7">
                  <path d="M16.36 12.63c-.02-2.3 1.88-3.4 1.97-3.46-1.07-1.57-2.74-1.79-3.34-1.81-1.42-.14-2.77.84-3.49.84-.72 0-1.83-.82-3-.8-1.55.02-2.97.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74s1.78.74 3 .72c1.24-.02 2.02-1.12 2.78-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.39-3.68ZM14.1 5.46c.63-.77 1.06-1.83.94-2.9-.91.04-2.02.61-2.67 1.37-.58.67-1.09 1.76-.96 2.79 1.02.08 2.06-.51 2.69-1.26Z" />
                </svg>
              }
            />
            <MagazaRozeti
              magaza="Google Play"
              ustSatir="Yakında"
              simge={
                <svg viewBox="0 0 24 24" fill="currentColor" className="size-6">
                  <path d="M3.6 2.4c-.27.28-.43.72-.43 1.29v16.62c0 .57.16 1.01.43 1.29l.06.05 9.31-9.31v-.22L3.66 2.35ZM16.1 15.5l-3.1-3.1v-.22l3.1-3.1.07.04 3.68 2.09c1.05.6 1.05 1.57 0 2.17l-3.68 2.09ZM16.17 15.46 13 12.28 3.6 21.65c.35.37.92.41 1.57.05l11-6.24M16.17 8.54 5.17 2.3c-.65-.37-1.22-.32-1.57.04L13 11.72Z" />
                </svg>
              }
            />
          </div>

          <p className="mt-8 text-[0.9375rem] text-soft">
            Soru, öneri veya erken erişim için{" "}
            <a
              href={`mailto:${site.destekEposta}`}
              className="text-lime underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
            >
              {site.destekEposta}
            </a>
          </p>
        </Beliren>
      </div>
    </section>
  );
}

function MagazaRozeti({
  magaza,
  ustSatir,
  simge,
}: {
  magaza: string;
  ustSatir: string;
  simge: React.ReactNode;
}) {
  return (
    <div className="cam flex items-center gap-3.5 rounded-2xl px-6 py-3.5 text-left">
      <span className="text-muted">{simge}</span>
      <span className="flex flex-col leading-tight">
        <span className="text-[0.6875rem] uppercase tracking-[0.18em] text-lime">
          {ustSatir}
        </span>
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
          {magaza}
        </span>
      </span>
    </div>
  );
}
