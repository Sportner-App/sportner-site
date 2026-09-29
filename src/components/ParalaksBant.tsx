"use client";

import { useReducedMotion, useScroll } from "motion/react";
import { useRef } from "react";

import { araDeger } from "@/lib/aradeger";
import { useIlerlemeStili } from "@/lib/kaydirma";

type Props = {
  gorsel: string;
  gorselSet?: string;
  boyutlar?: string;
  etiket: string;
  baslik: string;
  metin: string;
};

/**
 * Tam genislikte fotograf serit. Fotograf serit icinde kendi hizinda kayar —
 * serit ekranda ilerlerken gorsel daha yavas hareket eder, arka planla on plan
 * ayrisir.
 */
export default function ParalaksBant({
  gorsel,
  gorselSet,
  boyutlar = "100vw",
  etiket,
  baslik,
  metin,
}: Props) {
  const bolum = useRef<HTMLElement>(null);
  const azalt = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: bolum,
    offset: ["start end", "end start"],
  });

  // Gorsel serit yuksekliginin %8'i kadar kayar; bu yuzden gorsel kabi %116
  // yukseklikte ve ustten -%8 kaydirilmis duruyor ki bosluk acilmasin.
  // Kaydirmaya bagli deger neden elle yaziliyor: src/lib/kaydirma.ts
  const gorselRef = useIlerlemeStili<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.transform = `translateY(${araDeger(p, [0, 1], [-8, 8])}%)`;
  });

  return (
    <section
      ref={bolum}
      className="relative flex min-h-[26rem] items-end overflow-hidden py-20 md:min-h-[34rem] md:py-28"
    >
      <div
        ref={azalt ? undefined : gorselRef}
        aria-hidden
        className="absolute inset-x-0 -top-[8%] -z-20 h-[116%]"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={gorsel}
          srcSet={gorselSet}
          sizes={boyutlar}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      </div>

      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-bg/62 to-bg/25"
      />

      <div className="govde relative">
        <p className="etiket">{etiket}</p>
        <h2 className="baslik mt-4 max-w-2xl text-[clamp(2rem,5.4vw,4rem)]">
          {baslik}
        </h2>
        <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">{metin}</p>
      </div>
    </section>
  );
}
