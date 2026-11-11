"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

type OnayIstegi = {
  baslik: string;
  metin: ReactNode;
  onayAd: string;
  /** Ban gibi geri dönüşü zor işlemler kırmızı düğmeyle sorulur. */
  tehlikeli?: boolean;
};

/**
 * Tarayıcının confirm() kutusu yerine panelin kendi onay penceresi.
 * Kullanım: const [onayIste, pencere] = useOnay(); ... if (!(await onayIste({...}))) return;
 * ve bileşen ağacına {pencere} eklenir.
 */
export function useOnay(): [(istek: OnayIstegi) => Promise<boolean>, ReactNode] {
  const [istek, setIstek] = useState<OnayIstegi | null>(null);
  const cozum = useRef<((sonuc: boolean) => void) | null>(null);

  const onayIste = useCallback(
    (yeni: OnayIstegi) =>
      new Promise<boolean>((resolve) => {
        cozum.current = resolve;
        setIstek(yeni);
      }),
    [],
  );

  const kapat = useCallback((sonuc: boolean) => {
    cozum.current?.(sonuc);
    cozum.current = null;
    setIstek(null);
  }, []);

  const pencere = istek ? <OnayPenceresi istek={istek} onKapat={kapat} /> : null;
  return [onayIste, pencere];
}

function OnayPenceresi({ istek, onKapat }: { istek: OnayIstegi; onKapat: (sonuc: boolean) => void }) {
  const onayDugmesi = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    onayDugmesi.current?.focus();
    const tus = (event: KeyboardEvent) => {
      if (event.key === "Escape") onKapat(false);
    };
    window.addEventListener("keydown", tus);
    return () => window.removeEventListener("keydown", tus);
  }, [onKapat]);

  return (
    <div
      className="admin-pencere-arka fixed inset-0 z-50 grid place-items-center bg-bg/70 px-4 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onKapat(false);
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="onay-baslik"
        className="admin-pencere w-full max-w-md overflow-hidden rounded-3xl border border-line-strong bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
      >
        <div className={`h-1 w-full ${istek.tehlikeli ? "bg-basketbol" : "bg-lime"}`} />
        <div className="p-6">
          <h2 id="onay-baslik" className="font-display text-lg font-bold">
            {istek.baslik}
          </h2>
          <div className="mt-2 text-sm leading-relaxed text-muted">{istek.metin}</div>
          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onKapat(false)}
              className="rounded-full px-5 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              Vazgeç
            </button>
            <button
              ref={onayDugmesi}
              type="button"
              onClick={() => onKapat(true)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.03] ${
                istek.tehlikeli ? "bg-basketbol" : "bg-lime"
              }`}
            >
              {istek.onayAd}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
