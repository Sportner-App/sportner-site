"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  gorece,
  istek,
  tarih,
  type KullaniciOturumu,
  type Sayfa,
  type SikayetKaydi,
} from "@/lib/admin/api";

import { useOnay } from "./Onay";
import { Hata, mesaj, Sayfalama, TEHLIKE_DUGME } from "./ortak";
import { SikayetKarti } from "./Sikayetler";

// ---------------------------------------------------------------- Şikâyet geçmişi

const YONLER = [
  { id: "against", ad: "Hakkındaki" },
  { id: "by", ad: "Yaptığı" },
] as const;

type Yon = (typeof YONLER)[number]["id"];

export function SikayetGecmisi({
  kullaniciId,
  onKullanici,
  onDegisti,
}: {
  kullaniciId: string;
  onKullanici: (id: string) => void;
  /** Bir şikâyet işlendikten sonra (sayaçlar değişebilir) üst detayı yenilemek için. */
  onDegisti: () => void;
}) {
  const [yon, setYon] = useState<Yon>("against");
  const [sayfaNo, setSayfaNo] = useState(1);
  const [sayfa, setSayfa] = useState<Sayfa<SikayetKaydi> | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const sonIstek = useRef(0);

  const yukle = useCallback(async () => {
    const no = ++sonIstek.current;
    setHata(null);
    const parametre = new URLSearchParams({ direction: yon, page: String(sayfaNo), pageSize: "10" });
    try {
      const yeni = await istek<Sayfa<SikayetKaydi>>(`/api/admin/users/${kullaniciId}/reports?${parametre}`);
      if (no !== sonIstek.current) return;
      if (yeni.items.length === 0 && sayfaNo > 1) {
        setSayfaNo(sayfaNo - 1);
        return;
      }
      setSayfa(yeni);
    } catch (error) {
      if (no === sonIstek.current) setHata(mesaj(error));
    }
  }, [kullaniciId, yon, sayfaNo]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  return (
    <div className="mt-8">
      <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-soft">Şikâyet geçmişi</h3>

      <div className="flex flex-wrap gap-2">
        {YONLER.map((y) => (
          <button
            key={y.id}
            type="button"
            onClick={() => {
              setSayfaNo(1);
              setSayfa(null);
              setYon(y.id);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              yon === y.id ? "border-lime text-lime" : "border-line text-muted hover:text-ink"
            }`}
          >
            {y.ad}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Hata metin={hata} />
      </div>

      <div className="mt-2 flex flex-col gap-3">
        {sayfa?.items.map((kayit) => (
          <SikayetKarti
            key={kayit.id}
            kayit={kayit}
            onKullanici={onKullanici}
            onDegisti={() => {
              void yukle();
              onDegisti();
            }}
          />
        ))}
      </div>

      {sayfa && sayfa.items.length === 0 ? <p className="py-10 text-center text-muted">Şikâyet yok.</p> : null}
      {sayfa ? <Sayfalama sayfa={sayfa} onDegis={setSayfaNo} /> : null}
    </div>
  );
}

// ---------------------------------------------------------------- Oturumlar

/** Ham userAgent'tan okunur kısa bir cihaz/tarayıcı özeti. */
function cihazAdi(userAgent: string | null): string {
  if (!userAgent) return "Bilinmeyen cihaz";
  const ua = userAgent;
  const platform = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : null;
  const tarayici = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : null;
  const ozet = [platform, tarayici].filter(Boolean).join(" · ");
  return ozet || (ua.length > 48 ? `${ua.slice(0, 48)}…` : ua);
}

export function Oturumlar({ kullaniciId, onDegisti }: { kullaniciId: string; onDegisti: () => void }) {
  const [liste, setListe] = useState<KullaniciOturumu[] | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const [onayIste, onayPenceresi] = useOnay();

  const sonIstek = useRef(0);

  const yukle = useCallback(async () => {
    const no = ++sonIstek.current;
    try {
      const yeni = await istek<KullaniciOturumu[]>(`/api/admin/users/${kullaniciId}/sessions`);
      if (no === sonIstek.current) setListe(yeni);
    } catch (error) {
      if (no === sonIstek.current) setHata(mesaj(error));
    }
  }, [kullaniciId]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const hepsiniKapat = async () => {
    const onay = await onayIste({
      baslik: "Tüm oturumlar kapatılsın mı?",
      metin:
        "Kullanıcı tüm cihazlarda yeniden giriş yapmak zorunda kalır. Açık uygulamalar kısa süre daha çalışabilir.",
      onayAd: "Tüm oturumları kapat",
      tehlikeli: true,
    });
    if (!onay) return;
    setBekliyor(true);
    setHata(null);
    setBasari(null);
    try {
      const sonuc = await istek<{ revokedCount: number }>(`/api/admin/users/${kullaniciId}/revoke-sessions`, {
        method: "POST",
      });
      setBasari(`${sonuc.revokedCount} oturum kapatıldı.`);
      await yukle();
      onDegisti();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  return (
    <div className="mt-8">
      {onayPenceresi}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-mono text-xs uppercase tracking-[0.18em] text-soft">Oturumlar</h3>
        <button
          type="button"
          disabled={bekliyor || !liste || liste.length === 0}
          onClick={() => void hepsiniKapat()}
          className={TEHLIKE_DUGME}
        >
          {bekliyor ? "Kapatılıyor…" : "Tüm oturumları kapat"}
        </button>
      </div>

      <Hata metin={hata} />
      {basari ? (
        <p className="rounded-xl border border-lime/40 bg-lime/10 px-4 py-3 text-sm text-lime">{basari}</p>
      ) : null}

      <div className="mt-2 overflow-hidden rounded-3xl border border-line bg-surface">
        <ul className="divide-y divide-line">
          {liste?.map((o) => (
            <li key={o.id} className="px-5 py-4">
              <p className="truncate text-sm font-semibold" title={o.userAgent ?? undefined}>
                {cihazAdi(o.userAgent)}
              </p>
              <p className="mt-1 text-xs text-soft">
                IP: {o.ipAddress ?? "—"} · Başlangıç: {tarih(o.createdAt)} · Son yenileme:{" "}
                {o.lastRotatedAt ? gorece(o.lastRotatedAt) : "—"} · Bitiş: {tarih(o.expiresAt)}
              </p>
            </li>
          ))}
        </ul>
        {liste && liste.length === 0 ? <p className="py-10 text-center text-muted">Aktif oturum yok.</p> : null}
      </div>
    </div>
  );
}
