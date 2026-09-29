"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const baglantilar = [
  { ad: "Özellikler", yol: "/#ozellikler" },
  { ad: "Sporlar", yol: "/#sporlar" },
  { ad: "Destek", yol: "/destek/" },
];

/**
 * Sabit ust baslik. Sayfa kaydirilinca saydamdan cam panele gecer — tepedeyken
 * hero gorselinin onunde durmasin diye.
 */
export default function Baslik() {
  const [kaydi, setKaydi] = useState(false);
  const [menuAcik, setMenuAcik] = useState(false);

  useEffect(() => {
    const bak = () => setKaydi(window.scrollY > 24);
    bak();
    window.addEventListener("scroll", bak, { passive: true });
    return () => window.removeEventListener("scroll", bak);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-500 ${
        kaydi || menuAcik
          ? "border-b border-line bg-bg/72 backdrop-blur-xl backdrop-saturate-150"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="govde flex h-16 items-center justify-between gap-6 md:h-[4.5rem]">
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setMenuAcik(false)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" width={28} height={28} className="size-7" />
          <span className="font-[family-name:var(--font-display)] text-[0.95rem] font-bold uppercase tracking-[0.28em] text-ink">
            Sportner
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {baglantilar.map((b) => (
            <Link
              key={b.yol}
              href={b.yol}
              className="text-[0.9375rem] text-muted transition-colors hover:text-ink"
            >
              {b.ad}
            </Link>
          ))}
          <a
            href="#indir"
            className="rounded-full bg-lime px-5 py-2 text-[0.9375rem] font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
          >
            İndir
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setMenuAcik((a) => !a)}
          aria-expanded={menuAcik}
          aria-label={menuAcik ? "Menüyü kapat" : "Menüyü aç"}
          className="relative size-10 md:hidden"
        >
          <span
            className={`absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 bg-ink transition-transform duration-300 ${
              menuAcik ? "rotate-45" : "-translate-y-1"
            }`}
          />
          <span
            className={`absolute left-1/2 top-1/2 h-px w-5 -translate-x-1/2 bg-ink transition-transform duration-300 ${
              menuAcik ? "-rotate-45" : "translate-y-1"
            }`}
          />
        </button>
      </div>

      {/* Mobil menu: yukseklik gecisi grid-rows ile, sabit yukseklik vermeden */}
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-500 md:hidden ${
          menuAcik ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <nav className="min-h-0">
          <ul className="govde flex flex-col gap-1 pb-6 pt-2">
            {[...baglantilar, { ad: "İndir", yol: "/#indir" }].map((b) => (
              <li key={b.yol}>
                <Link
                  href={b.yol}
                  onClick={() => setMenuAcik(false)}
                  className="block border-b border-line py-3.5 text-lg text-muted transition-colors hover:text-ink"
                >
                  {b.ad}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
