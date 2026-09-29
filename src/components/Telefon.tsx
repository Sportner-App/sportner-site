import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * iPhone cercevesi. Ekran goruntuleri App Store karelerinden cerceve disi
 * kesildigi icin (tools/gorselleri-hazirla.mjs) cerceve burada, CSS ile
 * ciziliyor: her olcude keskin kaliyor ve golge/yansima kontrol edilebiliyor.
 *
 * En-boy orani 19.5:9 — kesilen goruntulerle ayni.
 */
export default function Telefon({ children, className = "" }: Props) {
  return (
    <div
      className={`relative aspect-[9/19.5] rounded-[2.75rem] bg-[#0b0b0d] p-[0.6rem] shadow-[0_2px_0_rgba(255,255,255,0.14)_inset,0_50px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/12 ${className}`}
    >
      {/* Metal kasa parlamasi */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2.75rem] bg-gradient-to-br from-white/14 via-transparent to-white/6"
      />

      <div className="relative h-full w-full overflow-hidden rounded-[2.2rem] bg-bg">
        {children}

        {/* Dynamic Island */}
        <div
          aria-hidden
          className="absolute left-1/2 top-[0.6rem] h-[1.45rem] w-[5.4rem] -translate-x-1/2 rounded-full bg-black"
        />

        {/* Cam yansimasi */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/8"
        />
      </div>
    </div>
  );
}
