"use client";

import { useMotionValueEvent, type MotionValue } from "motion/react";
import { useEffect, useRef } from "react";

/**
 * Kaydirma ilerlemesini bir elemanin stiline dogrudan yazar.
 *
 * Neden motion'un `style={{ opacity: useTransform(scrollYProgress, ...) }}`
 * yolu kullanilmiyor: motion v12 kaydirmaya bagli opaklik ve donusumleri WAAPI
 * ile hizlandirirken animasyonu bir **ViewTimeline**'a bagliyor. O zaman
 * cizelgesi "eleman ekrandan gecerken" ilerler; `useScroll`'a verilen
 * `offset` ile ortusmedigi durumlar var ve sabitlenmis (sticky) bir sahnede
 * — eleman ekranda hic hareket etmedigi icin — tamamen kayiyor. Sonucta
 * kareler yanlis anda beliriyordu.
 *
 * Burada deger her kaydirma karesinde elle yaziliyor: React yeniden render
 * etmiyor, WAAPI devreye girmiyor, davranis `offset` ne diyorsa o.
 */
export function useIlerlemeStili<T extends HTMLElement>(
  ilerleme: MotionValue<number>,
  uygula: (eleman: T, p: number) => void,
) {
  const ref = useRef<T>(null);

  // Geri cagrim her render'da yeniden olusuyor; olay aboneligini her seferinde
  // kurup bozmamak icin ref uzerinden guncelleniyor.
  const uygulaRef = useRef(uygula);
  uygulaRef.current = uygula;

  // Ilk boyama: olay yalnizca deger degisince tetiklendigi icin, sayfa
  // bolumun ortasinda acildiginda baslangic degeri yazilmis olmali.
  useEffect(() => {
    if (ref.current) uygulaRef.current(ref.current, ilerleme.get());
  }, [ilerleme]);

  useMotionValueEvent(ilerleme, "change", (p) => {
    if (ref.current) uygulaRef.current(ref.current, p);
  });

  return ref;
}
