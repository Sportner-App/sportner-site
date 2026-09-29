"use client";

import { useReducedMotion, useScroll, type MotionValue } from "motion/react";
import { useRef } from "react";

import Telefon from "./Telefon";
import { araDeger } from "@/lib/aradeger";
import { useIlerlemeStili } from "@/lib/kaydirma";
import { pencere, uclariDuzle } from "@/lib/sahne";

type Adim = {
  gorsel: string;
  baslik: string;
  metin: string;
  /** Telefonun arkasindaki isigin rengi; uygulamadaki spor aksanlarindan. */
  aksan: string;
};

const adimlar: Adim[] = [
  {
    gorsel: "/ekranlar/liste.webp",
    baslik: "Yakınındaki sporu bul",
    metin:
      "Şehrindeki bütün etkinlikler tek akışta. Konumuna göre sıralanır; spor dalı, tarih ve seviyeye göre filtrelersin.",
    aksan: "#ccff00",
  },
  {
    gorsel: "/ekranlar/harita.webp",
    baslik: "Haritada keşfet",
    metin:
      "En yakın maç bir dokunuş uzakta. Kümelenmiş işaretlerle semt semt gezer, sahayı görmeden yola çıkmazsın.",
    aksan: "#5eead4",
  },
  {
    gorsel: "/ekranlar/detay.webp",
    baslik: "Detayları gör, kadroya katıl",
    metin:
      "Yer, saat, süre, kontenjan, yaş aralığı ve ücret — hepsi katılmadan önce önünde. Tek dokunuşla kadroya gir.",
    aksan: "#ff6b1a",
  },
  {
    gorsel: "/ekranlar/kadro.webp",
    baslik: "Kiminle oynayacağını bil",
    metin:
      "Takım arkadaşlarını önceden tanı. Herkesin seviyesi, oyuncu puanı ve katılım geçmişi profilinde duruyor.",
    aksan: "#9a72ff",
  },
  {
    gorsel: "/ekranlar/akis.webp",
    baslik: "Topluluğu takip et",
    metin:
      "Maç sonrası kareler, yorumlar ve şehre yeni katılan sporcular. Keşfet akışı sahayı sahadan sonra da sürdürür.",
    aksan: "#fbbf24",
  },
];

export default function EkranAkisi() {
  const bolum = useRef<HTMLElement>(null);
  const azalt = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: bolum,
    offset: ["start start", "end end"],
  });

  // Hareket kapaliysa kaydirmaya bagli sahne yerine duz bir liste gosterilir:
  // sabitlenmis bolum, animasyon olmadan bos bir ekran gibi gorunurdu.
  if (azalt) return <DuzListe />;

  return (
    <section
      id="ekranlar"
      ref={bolum}
      className="relative"
      style={{ height: `${adimlar.length * 100 + 40}svh` }}
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="govde grid w-full items-center gap-7 md:grid-cols-[1fr_auto] md:gap-16">
          {/* Metin sutunu */}
          <div className="order-2 md:order-1">
            <p className="etiket">Uygulamada</p>

            <div className="relative mt-5 min-h-[11.5rem]">
              {adimlar.map((adim, i) => (
                <MetinKati
                  key={adim.baslik}
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
              (iPhone SE, kisa masaustu pencereler) alt taraf kirpilir. */}
          <div className="relative order-1 mx-auto w-[min(50vw,13rem,24svh)] md:order-2 md:w-[min(30vw,19rem,34svh)]">
            {/* Aktif adimin renginde arka isik */}
            {adimlar.map((adim, i) => (
              <Isik key={adim.baslik} adim={adim} sira={i} ilerleme={scrollYProgress} />
            ))}

            <Telefon className="relative z-10">
              {adimlar.map((adim, i) => (
                <EkranKati
                  key={adim.gorsel}
                  adim={adim}
                  sira={i}
                  ilerleme={scrollYProgress}
                />
              ))}
            </Telefon>
          </div>
        </div>
      </div>
    </section>
  );
}

function EkranKati({
  adim,
  sira,
  ilerleme,
}: {
  adim: Adim;
  sira: number;
  ilerleme: MotionValue<number>;
}) {
  const { giris, ...uc } = pencere(sira, adimlar.length);
  const saydamlik = uclariDuzle([0, 1, 1, 0], uc);
  const olcek = uclariDuzle([1.05, 1, 1, 0.96], uc);
  const ref = useIlerlemeStili<HTMLImageElement>(ilerleme, (el, p) => {
    el.style.opacity = String(araDeger(p, giris, saydamlik));
    el.style.transform = `scale(${araDeger(p, giris, olcek)})`;
  });

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={adim.gorsel}
      alt={`Sportner uygulaması — ${adim.baslik}`}
      width={780}
      height={1678}
      loading={sira === 0 ? "eager" : "lazy"}
      decoding="async"
      className="absolute inset-0 size-full object-cover"
      style={{ opacity: sira === 0 ? 1 : 0 }}
    />
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
  const { giris, ...uc } = pencere(sira, adimlar.length, "metin");
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
  const { giris, ...uc } = pencere(sira, adimlar.length);
  const saydamlik = uclariDuzle([0, 0.42, 0.42, 0], uc);
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
        <RayParcasi key={adim.baslik} sira={i} ilerleme={ilerleme} />
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
  const adet = adimlar.length;
  const ref = useIlerlemeStili<HTMLSpanElement>(ilerleme, (el, p) => {
    const dolgu = araDeger(p, [sira / adet, (sira + 1) / adet], [0, 1]);
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

/** Hareketi azaltilmis ortam icin sade, kaydirmaya bagli olmayan surum. */
function DuzListe() {
  return (
    <section id="ekranlar" className="govde py-24">
      <p className="etiket">Uygulamada</p>
      <div className="mt-10 grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
        {adimlar.map((adim) => (
          <div key={adim.baslik}>
            <div className="mx-auto w-[min(60vw,14rem)]">
              <Telefon>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={adim.gorsel}
                  alt={`Sportner uygulaması — ${adim.baslik}`}
                  width={780}
                  height={1678}
                  loading="lazy"
                  className="size-full object-cover"
                />
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
