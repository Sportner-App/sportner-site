"use client";

import { useReducedMotion, useScroll } from "motion/react";
import { useRef } from "react";

import Beliren from "./Beliren";
import { araDeger } from "@/lib/aradeger";
import { useIlerlemeStili } from "@/lib/kaydirma";

/**
 * Katalogdaki 35 bransin tamami. Aksan renkleri uygulamanin tasarim
 * belirteclerinden (sportnerApp/src/constants/design-tokens.js > sports)
 * birebir alindi — rozet renkleri site ile uygulamada ayni.
 */
const sporlar: [ad: string, renk: string][] = [
  ["Basketbol", "#ff6b1a"],
  ["Futbol", "#9ed900"],
  ["Voleybol", "#9a72ff"],
  ["Hentbol", "#14b8a6"],
  ["Plaj Voleybolu", "#fbbf24"],
  ["Ragbi", "#dc2626"],
  ["Tenis", "#d7ef32"],
  ["Masa Tenisi", "#22d3ee"],
  ["Badminton", "#f472b6"],
  ["Padel", "#6366f1"],
  ["Pickleball", "#d946ef"],
  ["Squash", "#0ea5e9"],
  ["Fitness", "#a855f7"],
  ["CrossFit", "#f43f5e"],
  ["Pilates", "#fb923c"],
  ["Yoga", "#34d399"],
  ["Dans", "#e879f9"],
  ["Boks", "#ef4444"],
  ["Kickboks", "#f97316"],
  ["Judo", "#3b82f6"],
  ["Jiu-Jitsu", "#8b5cf6"],
  ["Karate", "#eab308"],
  ["Koşu", "#42a5ff"],
  ["Bisiklet", "#22c55e"],
  ["Doğa Yürüyüşü", "#84cc16"],
  ["Tırmanış", "#d97706"],
  ["Yüzme", "#06b6d4"],
  ["Dalış", "#0284c7"],
  ["Yelken", "#38bdf8"],
  ["Kürek", "#1d4ed8"],
  ["Kayak", "#60a5fa"],
  ["Snowboard", "#a78bfa"],
  ["Bowling", "#be123c"],
  ["Golf", "#16a34a"],
  ["Okçuluk", "#ca8a04"],
];

const yarim = Math.ceil(sporlar.length / 2);
const siralar = [sporlar.slice(0, yarim), sporlar.slice(yarim)];

export default function Sporlar() {
  const bolum = useRef<HTMLElement>(null);
  const azalt = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: bolum,
    offset: ["start end", "end start"],
  });

  // Iki sira ters yonde suruklenir: bolum ekrandan gecerken satirlar birbirine
  // gore kayar, sabit bir seride gore daha canli durur.
  // Kaydirmaya bagli deger neden elle yaziliyor: src/lib/kaydirma.ts
  const ustRef = useIlerlemeStili<HTMLUListElement>(scrollYProgress, (el, p) => {
    el.style.transform = `translateX(${araDeger(p, [0, 1], [2, -14])}%)`;
  });
  const altRef = useIlerlemeStili<HTMLUListElement>(scrollYProgress, (el, p) => {
    el.style.transform = `translateX(${araDeger(p, [0, 1], [-14, 2])}%)`;
  });

  return (
    <section id="sporlar" ref={bolum} className="overflow-hidden py-24 md:py-32">
      <div className="govde">
        <Beliren>
          <p className="etiket">35 branş</p>
          <h2 className="baslik mt-4 max-w-2xl text-[clamp(2rem,5.4vw,3.75rem)]">
            Ne oynuyorsan burada bir kadro var.
          </h2>
        </Beliren>
      </div>

      <div className="mt-14 flex flex-col gap-4">
        {siralar.map((sira, i) => (
          <ul
            key={i}
            ref={azalt ? undefined : i === 0 ? ustRef : altRef}
            className="flex w-max gap-3 px-6"
          >
            {sira.map(([ad, renk]) => (
              <li key={ad}>
                <span
                  className="flex items-center gap-2.5 whitespace-nowrap rounded-full border px-5 py-2.5 text-[0.9375rem] font-medium text-ink transition-colors duration-300"
                  style={{
                    borderColor: `color-mix(in oklab, ${renk} 34%, transparent)`,
                    background: `color-mix(in oklab, ${renk} 9%, transparent)`,
                  }}
                >
                  <span
                    aria-hidden
                    className="block size-2 rounded-full"
                    style={{ background: renk }}
                  />
                  {ad}
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>

      <div className="govde">
        <Beliren gecikme={0.1}>
          <p className="mt-12 max-w-md leading-relaxed text-soft">
            Aradığın branş listede yoksa kendi etkinliğini açarken yazman yeterli;
            katalog topluluktan gelen taleplerle büyüyor.
          </p>
        </Beliren>
      </div>
    </section>
  );
}
