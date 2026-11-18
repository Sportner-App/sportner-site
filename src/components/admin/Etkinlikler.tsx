"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ETKINLIK_DURUMU,
  gorece,
  istek,
  KATILIMCI_DURUMU,
  tarih,
  type EtkinlikDetay,
  type EtkinlikOzet,
  type Sayfa,
} from "@/lib/admin/api";

import { useOnay } from "./Onay";
import { Bilgi, Hata, KullaniciSatiri, mesaj, Sayfalama, TEHLIKE_DUGME } from "./ortak";

export function EtkinlikDurumu({ durum }: { durum: number }) {
  const bilgi = ETKINLIK_DURUMU[durum];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${bilgi?.rozet ?? ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {bilgi?.ad ?? durum}
    </span>
  );
}

function TestRozeti() {
  return (
    <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted ring-1 ring-line">
      Test
    </span>
  );
}

const DURUM_SECENEKLERI = Object.entries(ETKINLIK_DURUMU).map(([deger, { ad }]) => ({ deger, ad }));

type Props = {
  onKullanici: (id: string) => void;
  /** Başka sekmeden (ör. kulüp detayı) doğrudan açılacak etkinlik. */
  acilisId?: string | null;
  onAcildi?: () => void;
};

export function Etkinlikler({ onKullanici, acilisId, onAcildi }: Props) {
  const [arama, setArama] = useState("");
  const [uygulanan, setUygulanan] = useState("");
  const [durum, setDurum] = useState("");
  const [sayfaNo, setSayfaNo] = useState(1);
  const [sayfa, setSayfa] = useState<Sayfa<EtkinlikOzet> | null>(null);
  const [secili, setSecili] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const sonIstek = useRef(0);

  // Arama kutusu debounce: yazmayı bırakınca uygulanır.
  useEffect(() => {
    const zamanlayici = setTimeout(() => {
      setUygulanan((onceki) => {
        const yeni = arama.trim();
        if (yeni !== onceki) setSayfaNo(1);
        return yeni;
      });
    }, 350);
    return () => clearTimeout(zamanlayici);
  }, [arama]);

  useEffect(() => {
    if (acilisId) {
      setSecili(acilisId);
      onAcildi?.();
    }
  }, [acilisId, onAcildi]);

  const yukle = useCallback(async () => {
    const no = ++sonIstek.current;
    setHata(null);
    const parametre = new URLSearchParams({ page: String(sayfaNo), pageSize: "25" });
    if (uygulanan) parametre.set("search", uygulanan);
    if (durum) parametre.set("status", durum);
    try {
      const yeni = await istek<Sayfa<EtkinlikOzet>>(`/api/admin/events?${parametre}`);
      if (no !== sonIstek.current) return;
      if (yeni.items.length === 0 && sayfaNo > 1) {
        setSayfaNo(sayfaNo - 1);
        return;
      }
      setSayfa(yeni);
    } catch (error) {
      if (no === sonIstek.current) setHata(mesaj(error));
    }
  }, [sayfaNo, uygulanan, durum]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  return (
    <section>
      {secili ? (
        <EtkinlikDetayi
          id={secili}
          onGeri={() => {
            setSecili(null);
            void yukle();
          }}
          onKullanici={onKullanici}
        />
      ) : null}

      {/* Liste açık kalır (gizlenir) ki geri dönünce filtre ve sayfa korunsun. */}
      <div className={secili ? "hidden" : ""}>
        <div className="flex flex-wrap gap-2">
          <input
            value={arama}
            onChange={(event) => setArama(event.target.value)}
            placeholder="Başlık ya da ID ara"
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-2.5 outline-none transition-colors placeholder:text-soft focus:border-lime"
          />
          <select
            value={durum}
            onChange={(event) => {
              setSayfaNo(1);
              setDurum(event.target.value);
            }}
            aria-label="Durum"
            className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm"
          >
            <option value="">Tüm durumlar</option>
            {DURUM_SECENEKLERI.map((s) => (
              <option key={s.deger} value={s.deger}>
                {s.ad}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <Hata metin={hata} />
        </div>

        <div className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface">
          <ul className="divide-y divide-line">
            {sayfa?.items.map((etkinlik) => (
              <li key={etkinlik.id}>
                <button
                  type="button"
                  onClick={() => setSecili(etkinlik.id)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2/60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold transition-colors group-hover:text-lime">
                        {etkinlik.title}
                      </span>
                      <EtkinlikDurumu durum={etkinlik.status} />
                      {etkinlik.isTestHosted ? <TestRozeti /> : null}
                    </span>
                    <span className="mt-1 block truncate text-sm text-soft">
                      {tarih(etkinlik.eventDate)}
                      {etkinlik.organizer ? ` · ${organizatorAdi(etkinlik)}` : ""}
                      {etkinlik.club ? ` · ${etkinlik.club.name}` : ""}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-soft">
                      {[etkinlik.sportName, etkinlik.cityName].filter(Boolean).join(" · ") || "Spor/şehir yok"}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm text-muted">
                    <span className="font-mono font-semibold">
                      {etkinlik.participantCount}
                      {etkinlik.maxParticipants ? ` / ${etkinlik.maxParticipants}` : ""}
                    </span>
                    <span className="block text-xs text-soft">katılımcı</span>
                  </span>
                  <span className="shrink-0 text-soft transition-colors group-hover:text-lime">→</span>
                </button>
              </li>
            ))}
          </ul>
          {sayfa && sayfa.items.length === 0 ? <p className="py-10 text-center text-muted">Etkinlik bulunamadı.</p> : null}
        </div>

        {sayfa ? <Sayfalama sayfa={sayfa} onDegis={setSayfaNo} /> : null}
      </div>
    </section>
  );
}

function organizatorAdi(etkinlik: EtkinlikOzet): string {
  const kisi = etkinlik.organizer;
  if (!kisi) return "";
  return kisi.username ? `@${kisi.username}` : [kisi.firstName, kisi.lastName].filter(Boolean).join(" ") || "Profil yok";
}

function EtkinlikDetayi({
  id,
  onGeri,
  onKullanici,
}: {
  id: string;
  onGeri: () => void;
  onKullanici: (id: string) => void;
}) {
  const [detay, setDetay] = useState<EtkinlikDetay | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const [onayIste, onayPenceresi] = useOnay();

  const yukle = useCallback(async () => {
    setHata(null);
    try {
      setDetay(await istek<EtkinlikDetay>(`/api/admin/events/${id}`));
    } catch (error) {
      setHata(mesaj(error));
    }
  }, [id]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const iptalEt = async () => {
    const onay = await onayIste({
      baslik: "Etkinlik iptal edilsin mi?",
      metin: "Katılımcılara iptal bildirimi gider. Geri alınamaz.",
      onayAd: "Etkinliği iptal et",
      tehlikeli: true,
    });
    if (!onay) return;
    setBekliyor(true);
    setHata(null);
    try {
      await istek<void>(`/api/admin/events/${id}/cancel`, { method: "POST" });
      await yukle();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  const iptalEdilebilir = detay !== null && (detay.status === 0 || detay.status === 1 || detay.status === 2);

  return (
    <div>
      {onayPenceresi}
      <button type="button" onClick={onGeri} className="text-sm text-soft hover:text-ink">
        ← Etkinlikler
      </button>

      <div className="mt-4">
        <Hata metin={hata} />
      </div>

      {detay ? (
        <>
          <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold">{detay.title}</h2>
                <EtkinlikDurumu durum={detay.status} />
                {detay.isTestHosted ? <TestRozeti /> : null}
              </div>

              {detay.description ? (
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted">{detay.description}</p>
              ) : null}

              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <Bilgi ad="Etkinlik tarihi" deger={tarih(detay.eventDate)} />
                <Bilgi ad="Oluşturulma" deger={`${tarih(detay.createdAt)} (${gorece(detay.createdAt)})`} />
                <Bilgi ad="Spor" deger={detay.sportName ?? "—"} />
                <Bilgi ad="Şehir" deger={detay.cityName ?? "—"} />
                <Bilgi ad="İlçe" deger={detay.district ?? "—"} />
                <Bilgi ad="Adres" deger={detay.address ?? "—"} />
                <Bilgi
                  ad="Katılımcı / kapasite"
                  deger={`${detay.participantCount}${detay.maxParticipants ? ` / ${detay.maxParticipants}` : ""}`}
                />
                <Bilgi
                  ad="Ücret"
                  deger={detay.isPaid ? (detay.feeAmount !== null ? `${detay.feeAmount} ₺` : "Ücretli") : "Ücretsiz"}
                />
                <Bilgi ad="Yalnızca kulüp üyeleri" deger={detay.isOrganizationOnly ? "Evet" : "Hayır"} />
                <Bilgi ad="Kulüp" deger={detay.club?.name ?? "—"} />
                <Bilgi ad="Açık şikâyet" deger={String(detay.openReports)} />
                <Bilgi ad="Toplam şikâyet" deger={String(detay.totalReports)} />
              </dl>

              {detay.organizer ? (
                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-soft">
                  <span>Organizatör:</span>
                  <KullaniciSatiri kisi={detay.organizer} onTikla={() => onKullanici(detay.organizer!.id)} />
                </div>
              ) : null}

              {iptalEdilebilir ? (
                <div className="mt-6">
                  <button type="button" disabled={bekliyor} onClick={() => void iptalEt()} className={TEHLIKE_DUGME}>
                    {bekliyor ? "Bekle…" : "Etkinliği iptal et"}
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <h3 className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.18em] text-soft">
            Katılımcılar ({detay.participants.length})
          </h3>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface">
            <ul className="divide-y divide-line">
              {detay.participants.map((katilimci, sira) => (
                <li key={katilimci.user?.id ?? `misafir-${sira}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="min-w-0 flex-1">
                    {katilimci.user ? (
                      <KullaniciSatiri kisi={katilimci.user} onTikla={() => onKullanici(katilimci.user!.id)} />
                    ) : (
                      <span className="text-sm text-muted">{katilimci.guestName ?? "Misafir"} (misafir)</span>
                    )}
                  </span>
                  <span className="text-xs text-soft">{KATILIMCI_DURUMU[katilimci.status] ?? katilimci.status}</span>
                  <span className="w-24 text-right text-xs text-soft" title={tarih(katilimci.joinedAt)}>
                    {katilimci.joinedAt ? gorece(katilimci.joinedAt) : "—"}
                  </span>
                </li>
              ))}
            </ul>
            {detay.participants.length === 0 ? <p className="py-10 text-center text-muted">Katılımcı yok.</p> : null}
          </div>
        </>
      ) : hata ? null : (
        <p className="py-10 text-center text-muted">Yükleniyor…</p>
      )}
    </div>
  );
}
