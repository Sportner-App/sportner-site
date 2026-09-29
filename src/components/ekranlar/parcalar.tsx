/**
 * Uygulama ekranlarinin ortak parcalari.
 *
 * Olcu birimi `cqw` (kap genisliginin yuzdesi): telefon cercevesi sayfada
 * hangi boyutta cizilirse cizilsin ekran icerigi ayni oranda olcekleniyor ve
 * hicbir yerde bulaniklasmiyor. Tasarim genisligi 390pt kabul edildi, yani
 * 1cqw = 3.9px; bir olcuyu cevirmek icin pt degerini 3.9'a bol.
 */
import type { ReactNode } from "react";

/** Adim animasyonlarinda gecikme/sure vermek icin. */
export type Zaman = { gecikme?: number; sure?: number };

export function zamanStili({ gecikme = 0, sure = 0.4 }: Zaman = {}) {
  return { "--g": gecikme, "--s": sure } as React.CSSProperties;
}

/* -------------------------------------------------------------------------- */

/** iOS durum cubugu. */
export function DurumCubugu({ saat = "09:41" }: { saat?: string }) {
  return (
    <div className="flex items-center justify-between px-[6.2cqw] pt-[3.6cqw] text-[3.85cqw] font-semibold text-white">
      <span>{saat}</span>
      <span className="flex items-center gap-[1.5cqw]">
        {/* sinyal */}
        <svg viewBox="0 0 18 12" className="h-[3cqw] w-[4.6cqw] fill-white/85">
          <circle cx="1.6" cy="9.4" r="1.4" />
          <circle cx="6" cy="9.4" r="1.4" />
          <circle cx="10.4" cy="9.4" r="1.4" />
          <circle cx="14.8" cy="9.4" r="1.4" />
        </svg>
        {/* wifi */}
        <svg viewBox="0 0 16 12" className="h-[3.1cqw] w-[4.1cqw] fill-white">
          <path d="M8 10.6 6.1 8.4a2.9 2.9 0 0 1 3.8 0Zm3.1-3.6a6 6 0 0 0-6.2 0L3.3 5.1a8.2 8.2 0 0 1 9.4 0ZM14 3.7a10.3 10.3 0 0 0-12 0L.4 1.8a12.6 12.6 0 0 1 15.2 0Z" />
        </svg>
        {/* pil */}
        <span className="relative flex h-[3.1cqw] w-[6.4cqw] items-center rounded-[1cqw] border border-white/45 px-[0.4cqw]">
          <span className="h-[1.9cqw] w-full rounded-[0.5cqw] bg-white" />
          <span className="absolute -right-[0.8cqw] h-[1.1cqw] w-[0.5cqw] rounded-r-[0.4cqw] bg-white/45" />
        </span>
      </span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** Ust baslik: marka + yuvarlak simge dugmeleri. */
export function UygulamaBasligi({
  artiVar = false,
  className = "",
  style,
}: {
  artiVar?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`flex items-center justify-between px-[4.6cqw] ${className}`}
      style={style}
    >
      <span className="flex items-center gap-[2.3cqw]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="size-[7.2cqw] rounded-full" />
        <span className="font-[family-name:var(--font-display)] text-[4.1cqw] font-bold tracking-[0.22em] text-white">
          SPORTNER
        </span>
      </span>

      <span className="flex items-center gap-[2.1cqw]">
        {artiVar && <SimgeDugmesi><PlusSimge /></SimgeDugmesi>}
        <SimgeDugmesi><AramaSimge /></SimgeDugmesi>
        <SimgeDugmesi><SohbetSimge /></SimgeDugmesi>
        <SimgeDugmesi nokta>
          <ZilSimge />
        </SimgeDugmesi>
      </span>
    </div>
  );
}

function SimgeDugmesi({
  children,
  nokta = false,
}: {
  children: ReactNode;
  nokta?: boolean;
}) {
  return (
    <span className="relative flex size-[9cqw] items-center justify-center rounded-full border border-white/12 bg-white/[0.06]">
      <span className="block size-[4.4cqw] text-white">{children}</span>
      {nokta && (
        <span className="absolute right-[1.4cqw] top-[1.4cqw] size-[1.8cqw] rounded-full bg-lime" />
      )}
    </span>
  );
}

const ince = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const PlusSimge = () => (
  <svg viewBox="0 0 24 24" {...ince} className="size-full text-lime">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const AramaSimge = () => (
  <svg viewBox="0 0 24 24" {...ince} className="size-full">
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);
const SohbetSimge = () => (
  <svg viewBox="0 0 24 24" {...ince} className="size-full">
    <path d="M20 12.5a4 4 0 0 1-4 4H9l-4 3v-3a4 4 0 0 1-1-7.9V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4Z" />
  </svg>
);
const ZilSimge = () => (
  <svg viewBox="0 0 24 24" {...ince} className="size-full">
    <path d="M18 16V11a6 6 0 1 0-12 0v5l-1.5 2.5h15Z" />
    <path d="M10 19.5a2 2 0 0 0 4 0" />
  </svg>
);

/* -------------------------------------------------------------------------- */

/** Alt sekme cubugu. Ortadaki lime dugme "etkinlik olustur". */
export function SekmeCubugu({
  aktif = 0,
  className = "",
  style,
}: {
  aktif?: 0 | 1 | 3 | 4;
  className?: string;
  style?: React.CSSProperties;
}) {
  const sekmeler = [EvSimge, PusulaSimge, null, TakvimSimge, null];

  return (
    <div
      className={`absolute inset-x-[4.1cqw] bottom-[2.6cqw] flex h-[15.4cqw] items-center justify-around rounded-full border border-white/10 bg-[#0c1a26]/88 backdrop-blur-md ${className}`}
      style={style}
    >
      {sekmeler.map((Simge, i) => {
        if (i === 2) {
          return (
            <span
              key={i}
              className="flex size-[13.3cqw] items-center justify-center rounded-full bg-lime shadow-[0_0_5cqw_rgba(204,255,0,0.45)]"
            >
              <svg viewBox="0 0 24 24" {...ince} className="size-[6.4cqw] text-bg">
                <rect x="3.5" y="5" width="17" height="15" rx="3.5" />
                <path d="M8 3v4m8-4v4M3.5 10h17M12 13.5v4m-2-2h4" />
              </svg>
            </span>
          );
        }
        if (i === 4) {
          return <Avatar key={i} kisi="kerem" boyut={8.7} halka={aktif === 4} />;
        }
        const Bilesen = Simge!;
        return (
          <span
            key={i}
            className={`flex size-[9.5cqw] items-center justify-center rounded-full ${
              aktif === i ? "bg-white/8" : ""
            }`}
          >
            <Bilesen dolu={aktif === i} />
          </span>
        );
      })}
    </div>
  );
}

const EvSimge = ({ dolu }: { dolu?: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    {...ince}
    fill={dolu ? "currentColor" : "none"}
    className={`size-[5.6cqw] ${dolu ? "text-lime" : "text-white/55"}`}
  >
    <path d="M4 10.5 12 4l8 6.5V20H4Z" />
  </svg>
);
const PusulaSimge = ({ dolu }: { dolu?: boolean }) => (
  <svg viewBox="0 0 24 24" {...ince} className={`size-[5.6cqw] ${dolu ? "text-lime" : "text-white/55"}`}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15 9-2 5-5 2 2-5Z" />
  </svg>
);
const TakvimSimge = ({ dolu }: { dolu?: boolean }) => (
  <svg viewBox="0 0 24 24" {...ince} className={`size-[5.6cqw] ${dolu ? "text-lime" : "text-white/55"}`}>
    <rect x="3.5" y="5" width="17" height="15" rx="3.5" />
    <path d="M8 3v4m8-4v4M3.5 10h17m-6.5 4-3.2 3.4L9 16" />
  </svg>
);

/* -------------------------------------------------------------------------- */

/**
 * Kullanici avatari.
 *
 * Fotograflar App Store karelerindeki seed edilmis demo hesaplardan kirpildi
 * (tools/gorselleri-hazirla.mjs); gercek kullanici degiller, ayni gorseller
 * App Store listesinde zaten yayinda. Halkayi site ciziyor, bu yuzden kirpma
 * halkanin icinden aliniyor.
 */
export function Avatar({
  kisi,
  ad,
  boyut = 7.2,
  halka = false,
  className = "",
  style,
}: {
  /** public/avatar/<kisi>.webp */
  kisi: string;
  /** Ekran okuyucu icin isim; bos birakilirsa avatar suslemedir. */
  ad?: string;
  boyut?: number;
  halka?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/avatar/${kisi}.webp`}
      alt={ad ?? ""}
      width={128}
      height={128}
      loading="lazy"
      decoding="async"
      className={`inline-block shrink-0 rounded-full object-cover ${
        halka ? "ring-[0.55cqw] ring-lime" : "ring-[0.5cqw] ring-[#0d1b27]"
      } ${className}`}
      style={{ width: `${boyut}cqw`, height: `${boyut}cqw`, ...style }}
    />
  );
}

/** Ust uste binen avatarlar + kalan sayisi. */
export function AvatarYigini({
  kisiler,
  kalan,
  boyut = 7.2,
}: {
  kisiler: string[];
  kalan?: number;
  boyut?: number;
}) {
  return (
    <span className="flex items-center">
      {kisiler.map((kisi, i) => (
        <Avatar
          key={kisi}
          kisi={kisi}
          boyut={boyut}
          className="girer patlar"
          style={{
            marginLeft: i === 0 ? 0 : `-${boyut * 0.3}cqw`,
            zIndex: kisiler.length - i,
            ...zamanStili({ gecikme: 0.4 + i * 0.05, sure: 0.22 }),
          }}
        />
      ))}
      {kalan !== undefined && (
        <span
          className="girer patlar inline-flex items-center justify-center rounded-full bg-[#1b2c3d] font-semibold text-white ring-[0.5cqw] ring-[#0d1b27]"
          style={{
            width: `${boyut}cqw`,
            height: `${boyut}cqw`,
            fontSize: `${boyut * 0.36}cqw`,
            marginLeft: `-${boyut * 0.3}cqw`,
            ...zamanStili({ gecikme: 0.4 + kisiler.length * 0.05, sure: 0.22 }),
          }}
        >
          +{kalan}
        </span>
      )}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

/** Spor rozeti. */
export function Rozet({
  children,
  renk,
  yazi = "#06111a",
  className = "",
  style,
}: {
  children: ReactNode;
  renk: string;
  yazi?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`inline-flex items-center gap-[1.3cqw] whitespace-nowrap rounded-full px-[2.8cqw] py-[1.1cqw] text-[2.9cqw] font-bold uppercase tracking-[0.06em] ${className}`}
      style={{ background: renk, color: yazi, ...style }}
    >
      {children}
    </span>
  );
}

/** Ucretsiz / tarih gibi ikincil rozet. */
export function SoluRozet({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full bg-black/55 px-[2.6cqw] py-[1.1cqw] text-[2.9cqw] font-semibold text-white backdrop-blur-sm ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------------------------------- */

/** Kontenjan cubugu. `oran` 0–1. */
export function KontenjanCubugu({
  oran,
  renk,
  gecikme = 0.55,
}: {
  oran: number;
  renk: string;
  gecikme?: number;
}) {
  return (
    <span className="block h-[0.9cqw] w-full overflow-hidden rounded-full bg-white/18">
      <span
        className="girer dolar block h-full rounded-full"
        style={{
          background: renk,
          "--dolu": oran,
          ...zamanStili({ gecikme, sure: 0.35 }),
        } as React.CSSProperties}
      />
    </span>
  );
}

/** Kucuk cizgi simgeler — kart ve detay meta satirlari icin. */
export const Simge = {
  Konum: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <path d="M12 21s6.5-5.4 6.5-10.4A6.5 6.5 0 0 0 5.5 10.6C5.5 15.6 12 21 12 21Z" />
      <circle cx="12" cy="10.3" r="2.4" />
    </svg>
  ),
  Takvim: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <rect x="3.5" y="5" width="17" height="15" rx="3.5" />
      <path d="M8 3v4m8-4v4M3.5 10h17" />
    </svg>
  ),
  Saat: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),
  Kisi: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </svg>
  ),
  Para: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <ellipse cx="12" cy="7" rx="7" ry="3" />
      <path d="M5 7v5c0 1.7 3.1 3 7 3s7-1.3 7-3V7M5 12v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    </svg>
  ),
  Filtre: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <path d="M4 6h16l-6 7v5l-4 2v-7Z" />
    </svg>
  ),
  Liste: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <path d="M4 7h2m4 0h10M4 12h2m4 0h10M4 17h2m4 0h10" />
    </svg>
  ),
  Harita: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <path d="m3.5 6.5 5.5-2 6 2 5.5-2v13l-5.5 2-6-2-5.5 2Zm5.5-2v13m6-11v13" />
    </svg>
  ),
  Kalp: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <path d="M12 20s-7.5-4.6-7.5-9.6A4 4 0 0 1 12 8a4 4 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20Z" />
    </svg>
  ),
  Yorum: () => (
    <svg viewBox="0 0 24 24" {...ince} className="size-full">
      <path d="M20 12.5a4 4 0 0 1-4 4H9l-4 3v-3a4 4 0 0 1-1-7.9V8a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4Z" />
    </svg>
  ),
};

/** Meta satirindaki simge + metin ikilisi. */
export function Meta({
  simge,
  children,
  renk = "text-white/70",
}: {
  simge: ReactNode;
  children: ReactNode;
  renk?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-[1.3cqw] text-[3.1cqw] ${renk}`}>
      <span className="block size-[3.6cqw] shrink-0">{simge}</span>
      {children}
    </span>
  );
}
