"use client";

import { motion, useReducedMotion, useScroll } from "motion/react";
import { useRef } from "react";

import { araDeger } from "@/lib/aradeger";
import { useIlerlemeStili } from "@/lib/kaydirma";

/** Basligin kelime kelime maskeden yukari kaymasi icin bolunmus hali. */
const satirlar = [
  ["Şehrindeki", "sporu"],
  ["bul,", "katıl,"],
  ["oynat."],
];

export default function Hero() {
  const bolum = useRef<HTMLElement>(null);
  const azalt = useReducedMotion();

  // Hero'dan cikarken gorsel yavasca uzaklasir, icerik soner: Apple'in urun
  // sayfalarindaki "kamera geride kaliyor" hissi.
  const { scrollYProgress } = useScroll({
    target: bolum,
    offset: ["start start", "end start"],
  });

  // Kaydirmaya bagli degerler neden elle yaziliyor: src/lib/kaydirma.ts
  const gorselRef = useIlerlemeStili<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.transform = `translateY(${araDeger(p, [0, 1], [0, 18])}%) scale(${araDeger(p, [0, 1], [1.06, 1.18])})`;
  });

  const icerikRef = useIlerlemeStili<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.transform = `translateY(${araDeger(p, [0, 1], [0, -70])}px)`;
    el.style.opacity = String(araDeger(p, [0, 0.62], [1, 0]));
  });

  const ipucuRef = useIlerlemeStili<HTMLDivElement>(scrollYProgress, (el, p) => {
    el.style.opacity = String(araDeger(p, [0, 0.62], [1, 0]));
  });

  return (
    <section
      ref={bolum}
      className="relative flex min-h-[38rem] items-center overflow-hidden"
      style={{ minHeight: "100svh" }}
    >
      {/* Arka plan fotografi */}
      <div
        ref={azalt ? undefined : gorselRef}
        aria-hidden
        className="absolute inset-0 -z-20"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/foto/hero.webp"
          srcSet="/foto/hero-900.webp 900w, /foto/hero-1400.webp 1400w, /foto/hero.webp 2022w"
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className="size-full object-cover object-[68%_center]"
        />
      </div>

      {/* Metnin okunmasi icin karartma. Fotograf zaten solda koyu, katmanlar
          o gecisi uzatiyor. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-bg via-bg/80 to-transparent"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-t from-bg via-transparent to-bg/55"
      />

      {/* Dikey dolgu ekran yuksekligine gore: 1280x720 gibi alcak dizustu
          ekranlarinda pt/pb-28 ile icerik 100svh'yi asiyor ve dugmelerle
          kaydirma ipucu ekranin altinda kaliyordu. */}
      <div
        ref={azalt ? undefined : icerikRef}
        className="govde relative pb-16 pt-24 [@media(min-height:820px)]:pb-28 [@media(min-height:820px)]:pt-28"
      >
        <motion.p
          className="etiket"
          initial={azalt ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          Spor topluluğu
        </motion.p>

        {/* Ust sinir ve kap genisligi birlikte secildi: "Şehrindeki sporu"
            tek satirda kalmali, yoksa baslik dort satira cikip hero'nun geri
            kalanini ekrandan tasiriyor. */}
        <h1 className="baslik mt-5 max-w-5xl text-[clamp(2.6rem,8.4vw,6rem)]">
          {satirlar.map((satir, s) => (
            <span key={s} className="block overflow-hidden pb-[0.08em]">
              {satir.map((kelime, k) => {
                const sira = satirlar.slice(0, s).flat().length + k;
                return (
                  <motion.span
                    key={kelime}
                    className="mr-[0.22em] inline-block"
                    initial={azalt ? false : { y: "108%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 1,
                      delay: 0.22 + sira * 0.075,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {kelime === "oynat." ? (
                      <span className="text-lime">{kelime}</span>
                    ) : (
                      kelime
                    )}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>

        <motion.p
          className="mt-8 max-w-lg text-lg leading-relaxed text-muted sm:text-xl"
          initial={azalt ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
        >
          Halı saha, basketbol, koşu, voleybol, yoga… Yakınındaki etkinlikleri
          haritada gör, seviyene uygun olanı seç, kadroya katıl.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-4"
          initial={azalt ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.74, ease: [0.16, 1, 0.3, 1] }}
        >
          <a
            href="#indir"
            className="rounded-full bg-lime px-7 py-3.5 font-semibold text-bg transition-transform duration-300 hover:scale-[1.04]"
          >
            Uygulamayı edin
          </a>
          <a
            href="#ekranlar"
            className="rounded-full border border-line-strong px-7 py-3.5 font-semibold text-ink transition-colors duration-300 hover:border-lime hover:text-lime"
          >
            Nasıl çalışır
          </a>
        </motion.div>
      </div>

      {/* Kaydirma ipucu */}
      <div
        ref={azalt ? undefined : ipucuRef}
        aria-hidden
        className="absolute inset-x-0 bottom-8 flex justify-center"
      >
        <motion.span
          className="flex h-11 w-7 items-start justify-center rounded-full border border-line-strong pt-2"
          initial={azalt ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
        >
          <motion.span
            className="block h-1.5 w-1.5 rounded-full bg-lime"
            animate={azalt ? undefined : { y: [0, 12, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.span>
      </div>
    </section>
  );
}
