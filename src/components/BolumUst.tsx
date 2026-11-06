"use client";

import { motion, useReducedMotion } from "motion/react";

type Props = {
  /** "02" gibi iki haneli bolum numarasi. */
  no: string;
  ad: string;
  toplam?: string;
};

/**
 * Bolumun ustundeki teknik serit: `// 02.00 OZELLIKLER ───── INDEX [02 / 06]`.
 * Cizgi gorus alanina girince soldan saga cizilir. Sayfa boyunca ayni serit
 * tekrarlandigi icin bolumler ayni "teknik cizim" dilini konusur.
 */
export default function BolumUst({ no, ad, toplam = "06" }: Props) {
  const azalt = useReducedMotion();

  return (
    <div className="flex items-center gap-4 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-soft">
      <span className="whitespace-nowrap text-lime">// {no}.00</span>
      <span className="whitespace-nowrap">{ad}</span>
      <motion.span
        aria-hidden
        className="h-px flex-1 origin-left bg-line-strong"
        initial={azalt ? false : { scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true, margin: "0px 0px -10% 0px" }}
        transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
      />
      <span className="hidden whitespace-nowrap sm:inline">
        INDEX [{no} / {toplam}]
      </span>
    </div>
  );
}
