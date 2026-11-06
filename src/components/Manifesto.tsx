"use client";

import { useReducedMotion, useScroll } from "motion/react";
import { useRef } from "react";

import { araDeger } from "@/lib/aradeger";
import BolumUst from "./BolumUst";
import InsaKatmani from "./InsaKatmani";
import { useIlerlemeStili } from "@/lib/kaydirma";

const metin =
  "Oynamak isteyen çok. Eksik olan hep aynı şey: kadro. Sportner o boşluğu kapatıyor — şehrindeki sporcuları aynı sahada buluşturuyor.";

/** Vurgulanacak kelimeler: aydinlaninca lime olur. */
const vurgu = new Set(["kadro.", "kapatıyor", "buluşturuyor."]);

const kelimeler = metin.split(" ");

/**
 * Kaydirdikca kelime kelime aydinlanan cumle. Ilerleme dogrudan kaydirma
 * konumuna bagli; kullanici yukari ciktiginda cumle geri soner.
 */
export default function Manifesto() {
  const bolum = useRef<HTMLDivElement>(null);
  const azalt = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: bolum,
    offset: ["start 0.85", "end 0.4"],
  });

  return (
    <section className="govde relative py-28 md:py-40">
      <BolumUst no="01" ad="Manifesto" />
      <div ref={bolum} className="mx-auto mt-16 max-w-4xl md:mt-24">
        <p data-insa className="baslik text-[clamp(1.75rem,4.6vw,3.25rem)] leading-[1.2]">
          {kelimeler.map((kelime, i) => (
            <Kelime
              key={`${kelime}-${i}`}
              ilerleme={scrollYProgress}
              basla={i / kelimeler.length}
              bit={(i + 1) / kelimeler.length}
              azalt={azalt}
              vurgulu={vurgu.has(kelime)}
            >
              {kelime}
            </Kelime>
          ))}
        </p>
      </div>
      <InsaKatmani />
    </section>
  );
}

function Kelime({
  children,
  ilerleme,
  basla,
  bit,
  azalt,
  vurgulu,
}: {
  children: string;
  ilerleme: ReturnType<typeof useScroll>["scrollYProgress"];
  basla: number;
  bit: number;
  azalt: boolean | null;
  vurgulu: boolean;
}) {
  const renk = vurgulu ? "text-lime" : undefined;
  // Kaydirmaya bagli deger neden elle yaziliyor: src/lib/kaydirma.ts
  const ref = useIlerlemeStili<HTMLSpanElement>(ilerleme, (el, p) => {
    el.style.opacity = String(araDeger(p, [basla, bit], [0.16, 1]));
  });

  if (azalt) {
    return <span className={`mr-[0.25em] inline-block ${renk ?? ""}`}>{children}</span>;
  }

  return (
    <span
      ref={ref}
      className={`mr-[0.25em] inline-block ${renk ?? ""}`}
      style={{ opacity: 0.16 }}
    >
      {children}
    </span>
  );
}
