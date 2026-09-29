import Link from "next/link";

import { site, yasalBaglantilar } from "@/lib/site";

const siteBaglantilari = [
  { ad: "Özellikler", yol: "/#ozellikler" },
  { ad: "Sporlar", yol: "/#sporlar" },
  { ad: "İndir", yol: "/#indir" },
];

export default function Altlik() {
  return (
    <footer className="border-t border-line bg-bg-2">
      <div className="govde flex flex-col gap-12 py-14 md:flex-row md:items-start md:justify-between md:py-16">
        <div className="max-w-xs">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" width={28} height={28} className="size-7" />
            <span className="font-[family-name:var(--font-display)] text-[0.95rem] font-bold uppercase tracking-[0.28em] text-ink">
              Sportner
            </span>
          </Link>
          <p className="mt-4 text-[0.9375rem] leading-relaxed text-soft">
            {site.slogan}
          </p>
        </div>

        <div className="flex flex-col gap-10 sm:flex-row sm:gap-16">
          <nav>
            <h2 className="etiket">Site</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {siteBaglantilari.map((b) => (
                <li key={b.yol}>
                  <Link
                    href={b.yol}
                    className="text-[0.9375rem] text-muted transition-colors hover:text-ink"
                  >
                    {b.ad}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <h2 className="etiket">Yasal</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              {yasalBaglantilar.map((b) => (
                <li key={b.yol}>
                  <Link
                    href={b.yol}
                    className="text-[0.9375rem] text-muted transition-colors hover:text-ink"
                  >
                    {b.ad}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="etiket">İletişim</h2>
            <ul className="mt-4 flex flex-col gap-2.5">
              <li>
                <a
                  href={`mailto:${site.destekEposta}`}
                  className="text-[0.9375rem] text-muted transition-colors hover:text-ink"
                >
                  {site.destekEposta}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="govde flex flex-col gap-2 py-6 text-[0.8125rem] text-soft sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sportner. Tüm hakları saklıdır.</p>
          <p>İstanbul</p>
        </div>
      </div>
    </footer>
  );
}
