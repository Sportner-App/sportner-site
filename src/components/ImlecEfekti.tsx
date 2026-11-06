"use client";

import { useEffect, useRef } from "react";

/**
 * Fare imlecinin yaninda gezen kucuk imlec suruusu. Yerel imlec gizlenmez
 * (erisilebilirlik ve alisilmis davranis icin); suru onun etrafinda durur:
 *
 *  - hareket     : her imlec bir oncekinin pesinden gelir, yilan gibi uzar
 *  - durunca     : imlecin etrafinda yorungeye girer, usulca doner
 *  - link ustunde: hepsi tek imlecte birlesir (gosteri biter, is baslar)
 *  - tiklama     : suru disari patlar, sonra yaylanarak geri toplanir
 *
 * Dokunmatik cihazlarda ve "hareketi azalt" aciksa hic calismaz. Konumlar React
 * durumuna degil dogrudan transform'a yazilir: her fare hareketinde yeniden
 * render olmaz.
 */

/**
 * Sitenin kendi paleti: lime ana renk, beyaz ve silik gri destek, bir de
 * koyu lime (zeytin) ton. Eskiden her imlec ayri bir renkteydi ve site diliyle
 * cakisiyordu. Lime birbirinden ayirt edilsin diye iki tonda tekrar eder.
 */
const RENKLER = [
  "#ccff00",
  "#f4f6f2",
  "#9ed900",
  "#ccff00",
  "#a8b2b8",
  "#e3ff66",
  "#7fb800",
  "#f4f6f2",
];
const ADET = RENKLER.length;

/** Yorunge yaricapi (px) ve donus hizi (rad/sn). */
const YORUNGE = 40;
const DONUS = 0.9;
/** Fare bu kadar ms kimildamazsa "durdu" sayilir ve suru yorungeye girer. */
const DURGUNLUK_MS = 220;
/** Tiklama patlamasinin yaricapi (px). */
const PATLAMA = 120;

/** Bir degeri hedefe yumusakca yaklastirir (kare hizindan bagimsiz). */
const yaklas = (su: number, hedef: number, hiz: number, dt: number) =>
  su + (hedef - su) * (1 - Math.exp(-hiz * dt));

const TIKLANABILIR =
  'a[href], button, summary, [role="button"], input, textarea, select, label[for]';

type Imlec = { x: number; y: number; egim: number };

export default function ImlecEfekti() {
  const ogeler = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const dugumler = ogeler.current;
    if (dugumler.some((d) => !d)) return;

    // Yalnizca fareli, hareket kisitlamasi olmayan cihazlar.
    const fareli = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const azalt = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fareli || azalt) return;

    const imlecler: Imlec[] = Array.from({ length: ADET }, () => ({
      x: -100,
      y: -100,
      egim: 0,
    }));

    let hx = -100;
    let hy = -100;
    let sonHareket = 0;
    let gorunur = false;
    let birlesik = false;
    /** 1'den 0'a sonen tiklama patlamasi. */
    let patlama = 0;
    /** 0 = hareket (iz), 1 = durgun (yorunge). Yumusak gecer. */
    let durgun = 0;
    /** 0 = dagilik, 1 = hepsi tek imlecte. Yumusak gecer. */
    let birlesme = 0;
    let faz = 0;
    let kare = 0;
    let onceki = performance.now();

    const goster = (ac: boolean) => {
      if (gorunur === ac) return;
      gorunur = ac;
      dugumler.forEach((d) => {
        if (d) d.style.opacity = ac ? "1" : "0";
      });
    };

    const hareket = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      hx = e.clientX;
      hy = e.clientY;
      sonHareket = performance.now();
      if (!gorunur) {
        // Ilk harekette suru imlecin oldugu yere isinlansin, kosarak gelmesin.
        imlecler.forEach((i) => {
          i.x = hx;
          i.y = hy;
        });
        goster(true);
      }
      const hedef = e.target instanceof Element ? e.target : null;
      birlesik = !!hedef?.closest(TIKLANABILIR);
    };

    const disari = () => goster(false);
    const tikla = (e: PointerEvent) => {
      if (e.pointerType === "mouse") patlama = 1;
    };

    const ciz = (simdi: number) => {
      // Sekme arka plandayken uzun bir bosluk olursa imlecler sicramasin.
      const dt = Math.min(0.05, (simdi - onceki) / 1000);
      onceki = simdi;
      faz += dt * DONUS;

      const durdu = simdi - sonHareket > DURGUNLUK_MS;
      durgun = yaklas(durgun, durdu ? 1 : 0, 3, dt);
      birlesme = yaklas(birlesme, birlesik ? 1 : 0, 9, dt);
      patlama = Math.max(0, patlama - dt * 1.6);

      for (let i = 0; i < ADET; i++) {
        const im = imlecler[i];
        const oran = i / ADET;

        // 1) Iz: imlec bir oncekinin (ilk imlec farenin) pesinden gelir.
        const onde = i === 0 ? { x: hx, y: hy } : imlecler[i - 1];
        // 2) Yorunge: farenin etrafinda esit aralikli, donen noktalar.
        const aci = faz + oran * Math.PI * 2;
        const yaricap =
          YORUNGE * (1 - birlesme) + PATLAMA * (patlama * patlama) * (1 - birlesme);
        const yx = hx + Math.cos(aci) * yaricap;
        const yy = hy + Math.sin(aci) * yaricap * 0.8;
        // 3) Birlesme: link ustunde hepsi farenin hemen yaninda ust uste.
        const bx = hx + 2 + i * 1.2;
        const by = hy + 2 + i * 1.2;

        // Izden yorungeye, sonra birlesmeye karisim.
        const izX = onde.x + (i === 0 ? 0 : 6);
        const izY = onde.y + (i === 0 ? 0 : 4);
        let tx = izX + (yx - izX) * durgun;
        let ty = izY + (yy - izY) * durgun;
        // Patlama sirasinda iz da yorungeye kayar: dalga her yone yayilir.
        const pat = Math.min(1, patlama * 1.4);
        tx += (yx - tx) * pat;
        ty += (yy - ty) * pat;
        tx += (bx - tx) * birlesme;
        ty += (by - ty) * birlesme;

        // Arkadaki imlecler daha tembel: iz uzar, yilan gibi gorunur.
        const hiz = (22 - i * 1.7) * (1 + patlama * 0.6);
        const ex = im.x;
        im.x = yaklas(im.x, tx, hiz, dt);
        im.y = yaklas(im.y, ty, hiz, dt);

        // Yatay hizina gore hafifce yatar: canli gorunur.
        const vx = dt > 0 ? (im.x - ex) / dt : 0;
        im.egim = yaklas(im.egim, Math.max(-28, Math.min(28, vx * 0.04)), 12, dt);

        const d = dugumler[i];
        if (d) {
          const olcek = (1 - oran * 0.32) * (1 - birlesme * 0.15);
          d.style.transform = `translate(${im.x}px, ${im.y}px) rotate(${im.egim}deg) scale(${olcek})`;
        }
      }

      kare = requestAnimationFrame(ciz);
    };
    kare = requestAnimationFrame(ciz);

    window.addEventListener("pointermove", hareket, { passive: true });
    window.addEventListener("pointerdown", tikla, { passive: true });
    document.documentElement.addEventListener("pointerleave", disari);

    return () => {
      cancelAnimationFrame(kare);
      window.removeEventListener("pointermove", hareket);
      window.removeEventListener("pointerdown", tikla);
      document.documentElement.removeEventListener("pointerleave", disari);
    };
  }, []);

  return (
    <div aria-hidden>
      {RENKLER.map((renk, i) => (
        <div
          key={i}
          ref={(d) => {
            ogeler.current[i] = d;
          }}
          className="pointer-events-none fixed left-0 top-0 z-[2147483647] opacity-0 transition-opacity duration-300 will-change-transform"
          style={{ opacity: 0 }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 22 22"
            style={{
              display: "block",
              filter: "drop-shadow(0 2px 5px rgba(0,0,0,.45))",
              opacity: 1 - (i / ADET) * 0.45,
            }}
          >
            <path
              d="M3 2l14 6.2-5.6 1.7L9.7 15.6z"
              fill={renk}
              stroke="#06111a"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
