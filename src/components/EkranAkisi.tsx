"use client";

import { useReducedMotion, useScroll, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";

import Telefon from "./Telefon";
import {
  EkranAkis,
  EkranDetay,
  EkranHarita,
  EkranListe,
} from "./ekranlar";
import { araDeger } from "@/lib/aradeger";
import { useIlerlemeStili } from "@/lib/kaydirma";
import { pencere, uclariDuzle } from "@/lib/sahne";

type Adim = {
  anahtar: string;
  ekran: ReactNode;
  baslik: string;
  metin: string;
  /** Telefonun arkasindaki isigin rengi; uygulamadaki spor aksanlarindan. */
  aksan: string;
};

const adimlar: Adim[] = [
  {
    anahtar: "liste",
    ekran: <EkranListe />,
    baslik: "Yakınındaki sporu bul",
    metin:
      "Şehrindeki bütün etkinlikler tek akışta. Konumuna göre sıralanır; spor dalı, tarih ve seviyeye göre filtrelersin.",
    aksan: "#ccff00",
  },
  {
    anahtar: "harita",
    ekran: <EkranHarita />,
    baslik: "Haritada keşfet",
    metin:
      "En yakın maç bir dokunuş uzakta. Kümelenmiş işaretlerle semt semt gezer, sahayı görmeden yola çıkmazsın.",
    aksan: "#5eead4",
  },
  {
    anahtar: "detay",
    ekran: <EkranDetay />,
    baslik: "Detayları gör, kadroya katıl",
    metin:
      "Yer, saat, süre, kontenjan, yaş aralığı ve ücret — hepsi katılmadan önce önünde. Tek dokunuşla kadroya gir.",
    aksan: "#ff6b1a",
  },
  {
    anahtar: "kadro",
    ekran: <EkranDetay sekme="kadro" />,
    baslik: "Kiminle oynayacağını bil",
    metin:
      "Takım arkadaşlarını önceden tanı. Herkesin seviyesi, oyuncu puanı ve katılım geçmişi profilinde duruyor.",
    aksan: "#9a72ff",
  },
  {
    anahtar: "akis",
    ekran: <EkranAkis />,
    baslik: "Topluluğu takip et",
    metin:
      "Maç sonrası kareler, yorumlar ve şehre yeni katılan sporcular. Keşfet akışı sahayı sahadan sonra da sürdürür.",
    aksan: "#fbbf24",
  },
];

const ADET = adimlar.length;

export default function EkranAkisi() {
  const bolum = useRef<HTMLElement>(null);
  const azalt = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: bolum,
    offset: ["start start", "end end"],
  });

  // Cihaz sahne boyunca 3B'de hafifce salinir; ayni deger cam yansimasini da
  // surukler, boylece isik egimle birlikte kayiyor.
  const cihazRef = useIlerlemeStili<HTMLDivElement>(scrollYProgress, (el, p) => {
    const yatay = araDeger(p, [0, 1], [13, -13]);
    const dikey = araDeger(p, [0, 0.5, 1], [7, -2, 5]);
    el.style.transform = `rotateY(${yatay}deg) rotateX(${dikey}deg) translateZ(0)`;
    el.style.setProperty("--parlama", String(araDeger(p, [0, 1], [-1, 1])));
  });

  // Hareket kapaliysa kaydirmaya bagli sahne yerine duz bir liste gosterilir:
  // sabitlenmis bolum, animasyon olmadan bos bir ekran gibi gorunurdu.
  if (azalt) return <DuzListe />;

  return (
    <section
      id="ekranlar"
      ref={bolum}
      className="relative"
      style={{ height: `${ADET * 100 + 40}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="govde grid w-full items-center gap-7 md:grid-cols-[1fr_auto] md:gap-16">
          {/* Metin sutunu */}
          <div className="order-2 md:order-1">
            <p className="etiket">Uygulamada</p>

            <div className="relative mt-5 min-h-[11.5rem]">
              {adimlar.map((adim, i) => (
                <MetinKati
                  key={adim.anahtar}
                  adim={adim}
                  sira={i}
                  ilerleme={scrollYProgress}
                />
              ))}
            </div>

            <IlerlemeRayi ilerleme={scrollYProgress} />
          </div>

          {/* Telefon sutunu. Genislik svh ile de sinirli: sahne sabitlendigi
              icin telefon + metin 100svh'ye sigmali, yoksa alcak ekranlarda
              alt taraf kirpilir. */}
          <div
            className="relative order-1 mx-auto w-[min(50vw,13rem,24svh)] [perspective:1400px] md:order-2 md:w-[min(30vw,19rem,34svh)]"
          >
            {/* Aktif adimin renginde arka isik */}
            {adimlar.map((adim, i) => (
              <Isik
                key={adim.anahtar}
                adim={adim}
                sira={i}
                ilerleme={scrollYProgress}
              />
            ))}

            <div ref={cihazRef} className="relative z-10 [transform-style:preserve-3d]">
              <Telefon>
                {adimlar.map((adim, i) => (
                  <EkranKati
                    key={adim.anahtar}
                    adim={adim}
                    sira={i}
                    ilerleme={scrollYProgress}
                  />
                ))}
              </Telefon>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */

/**
 * Bir ekran katmani. Iki ayri ilerleme tasiyor:
 *
 *  - `opacity`  : adimlar arasi capraz gecis (pencere mantigi, lib/sahne.ts)
 *  - `--p`      : ekranin *kendi* ic animasyonu — kartlar, pinler, liste
 *                 satirlari bu degere gore sirayla giriyor (globals.css)
 *
 * Gorunmeyen katmanlar `visibility: hidden` oluyor: bes ekran da bagli kaliyor
 * ama yalnizca goruneni boyaniyor, backdrop-blur'lar bosa calismiyor.
 */
function EkranKati({
  adim,
  sira,
  ilerleme,
}: {
  adim: Adim;
  sira: number;
  ilerleme: MotionValue<number>;
}) {
  const { giris, ...uc } = pencere(sira, ADET);
  const saydamlik = uclariDuzle([0, 1, 1, 0], uc);
  const olcek = uclariDuzle([1.04, 1, 1, 0.97], uc);

  // Ic animasyon adim basladiginda oynar ve adim bitene kadar tam kalir.
  const icBasla = sira / ADET;
  const icBit = icBasla + 0.82 / ADET;

  const ref = useIlerlemeStili<HTMLDivElement>(ilerleme, (el, p) => {
    const o = araDeger(p, giris, saydamlik);
    el.style.opacity = String(o);
    el.style.visibility = o < 0.01 ? "hidden" : "visible";
    el.style.transform = `scale(${araDeger(p, giris, olcek)})`;
    el.style.setProperty("--p", String(araDeger(p, [icBasla, icBit], [0, 1])));
  });

  return (
    <div
      ref={ref}
      className="absolute inset-0"
      style={{ opacity: sira === 0 ? 1 : 0, visibility: sira === 0 ? "visible" : "hidden" }}
    >
      {adim.ekran}
    </div>
  );
}

function MetinKati({
  adim,
  sira,
  ilerleme,
}: {
  adim: Adim;
  sira: number;
  ilerleme: MotionValue<number>;
}) {
  const { giris, ...uc } = pencere(sira, ADET, "metin");
  const saydamlik = uclariDuzle([0, 1, 1, 0], uc);
  const kaydir = uclariDuzle([26, 0, 0, -26], uc);
  const ref = useIlerlemeStili<HTMLDivElement>(ilerleme, (el, p) => {
    el.style.opacity = String(araDeger(p, giris, saydamlik));
    el.style.transform = `translateY(${araDeger(p, giris, kaydir)}px)`;
  });

  return (
    <div
      ref={ref}
      className="absolute inset-x-0 top-0"
      style={{ opacity: sira === 0 ? 1 : 0 }}
    >
      <h2 className="baslik max-w-lg text-[clamp(1.9rem,4.4vw,3.25rem)]">
        {adim.baslik}
      </h2>
      <p className="mt-5 max-w-md text-lg leading-relaxed text-muted">
        {adim.metin}
      </p>
    </div>
  );
}

function Isik({
  adim,
  sira,
  ilerleme,
}: {
  adim: Adim;
  sira: number;
  ilerleme: MotionValue<number>;
}) {
  const { giris, ...uc } = pencere(sira, ADET);
  const saydamlik = uclariDuzle([0, 0.45, 0.45, 0], uc);
  const ref = useIlerlemeStili<HTMLDivElement>(ilerleme, (el, p) => {
    el.style.opacity = String(araDeger(p, giris, saydamlik));
  });

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute -inset-16 rounded-full blur-3xl"
      style={{
        opacity: 0,
        background: `radial-gradient(circle at 50% 45%, ${adim.aksan}, transparent 62%)`,
      }}
    />
  );
}

/** Kac adimdan kacinci oldugunu gosteren ince ray. */
function IlerlemeRayi({ ilerleme }: { ilerleme: MotionValue<number> }) {
  return (
    <ol className="mt-8 flex gap-2 md:mt-10" aria-hidden>
      {adimlar.map((adim, i) => (
        <RayParcasi key={adim.anahtar} sira={i} ilerleme={ilerleme} />
      ))}
    </ol>
  );
}

/** Rayin tek bir parcasi. Hook dongu icinde cagrilamayacagi icin ayri bilesen. */
function RayParcasi({
  sira,
  ilerleme,
}: {
  sira: number;
  ilerleme: MotionValue<number>;
}) {
  const ref = useIlerlemeStili<HTMLSpanElement>(ilerleme, (el, p) => {
    const dolgu = araDeger(p, [sira / ADET, (sira + 1) / ADET], [0, 1]);
    el.style.transform = `scaleX(${dolgu})`;
  });

  return (
    <li className="h-0.5 flex-1 overflow-hidden rounded-full bg-line">
      <span
        ref={ref}
        className="block h-full origin-left rounded-full bg-lime"
        style={{ transform: "scaleX(0)" }}
      />
    </li>
  );
}

/**
 * Hareketi azaltilmis ortam icin sade surum: ekranlar tam canlanmis halde
 * (--p: 1) yan yana duruyor, kaydirmaya bagli hicbir sey yok.
 */
function DuzListe() {
  return (
    <section id="ekranlar" className="govde py-24">
      <p className="etiket">Uygulamada</p>
      <div className="mt-10 grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
        {adimlar.map((adim) => (
          <div key={adim.anahtar}>
            <div className="mx-auto w-[min(60vw,14rem)]">
              <Telefon style={{ "--p": 1 } as React.CSSProperties}>
                {adim.ekran}
              </Telefon>
            </div>
            <h2 className="baslik mt-8 text-2xl">{adim.baslik}</h2>
            <p className="mt-3 leading-relaxed text-muted">{adim.metin}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
