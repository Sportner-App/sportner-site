"use client";

import { ApiHatasi } from "@/lib/admin/api";

export function mesaj(hata: unknown): string {
  return hata instanceof ApiHatasi || hata instanceof Error ? hata.message : "Beklenmeyen bir hata oluştu.";
}

export function Avatar({ url, ad, buyuk = false }: { url: string | null; ad: string; buyuk?: boolean }) {
  const boyut = buyuk ? "h-16 w-16 text-xl" : "h-10 w-10 text-sm";
  if (url) {
    // eslint-disable-next-line @next/next/no-img-element -- statik dışa aktarımda next/image optimize etmiyor
    return <img src={url} alt="" className={`${boyut} shrink-0 rounded-full object-cover ring-1 ring-line`} />;
  }
  return (
    <span className={`${boyut} grid shrink-0 place-items-center rounded-full bg-surface-2 font-semibold text-muted ring-1 ring-line`}>
      {(ad.trim()[0] ?? "?").toLocaleUpperCase("tr-TR")}
    </span>
  );
}

export function Sayfalama({
  sayfa,
  onDegis,
}: {
  sayfa: { page: number; totalPages: number; totalCount: number; hasNext: boolean; hasPrevious: boolean };
  onDegis: (yeni: number) => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between text-sm text-muted">
      <span>{sayfa.totalCount} kayıt</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!sayfa.hasPrevious}
          onClick={() => onDegis(sayfa.page - 1)}
          className="rounded-full border border-line px-3 py-1.5 disabled:opacity-30"
        >
          Önceki
        </button>
        <span className="font-mono text-xs">
          {sayfa.page} / {Math.max(sayfa.totalPages, 1)}
        </span>
        <button
          type="button"
          disabled={!sayfa.hasNext}
          onClick={() => onDegis(sayfa.page + 1)}
          className="rounded-full border border-line px-3 py-1.5 disabled:opacity-30"
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}

export function Hata({ metin }: { metin: string | null }) {
  return metin ? (
    <p className="rounded-xl border border-basketbol/40 bg-basketbol/10 px-4 py-3 text-sm text-basketbol">{metin}</p>
  ) : null;
}

export function Bilgi({ ad, deger, mono = false }: { ad: string; deger: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-soft">{ad}</dt>
      <dd className={`truncate ${mono ? "font-mono text-xs" : ""}`}>{deger}</dd>
    </div>
  );
}
