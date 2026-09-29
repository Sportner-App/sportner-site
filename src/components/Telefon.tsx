import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

/**
 * iPhone cercevesi. Ekran icerigi DOM ile ciziliyor, cerceve de CSS ile:
 * her olcude keskin kaliyor ve golge, yansima, 3B egim kontrol edilebiliyor.
 *
 * Ekran katmani `container-type: inline-size` tasiyor — icerideki her olcu
 * `cqw` cinsinden yazildigi icin cerceve buyudukce icerik oraniyla buyuyor.
 *
 * En-boy orani 19.5:9.
 */
export default function Telefon({ children, className = "", style }: Props) {
  return (
    <div
      className={`relative aspect-[9/19.5] rounded-[2.75rem] bg-[#0b0b0d] p-[0.6rem] shadow-[0_2px_0_rgba(255,255,255,0.14)_inset,0_50px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/12 ${className}`}
      style={style}
    >
      {/* Metal kasa parlamasi */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2.75rem] bg-gradient-to-br from-white/14 via-transparent to-white/6"
      />

      <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-bg [container-type:inline-size]">
        {children}

        {/* Dynamic Island */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[1.6cqw] z-20 h-[6.4cqw] w-[24cqw] -translate-x-1/2 rounded-full bg-black"
        />

        {/* Cam yansimasi — cihaz egildikce kayar */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 mix-blend-screen"
          style={{
            background:
              "linear-gradient(115deg, transparent 38%, rgba(255,255,255,0.10) 47%, rgba(255,255,255,0.02) 55%, transparent 62%)",
            transform: "translateX(calc(var(--parlama, 0) * 26%))",
          }}
        />
      </div>
    </div>
  );
}
