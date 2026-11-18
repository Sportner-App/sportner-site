"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  KULUP_ETKINLIK_POLITIKASI,
  KULUP_ROLU,
  KULUP_UYELIK_DURUMU,
  gorece,
  istek,
  tarih,
  type KulupDetay,
  type KulupOzet,
  type Sayfa,
} from "@/lib/admin/api";

import { EtkinlikDurumu } from "./Etkinlikler";
import { useOnay } from "./Onay";
import { ANA_DUGME, Avatar, Bilgi, Hata, IKINCIL_DUGME, KullaniciSatiri, mesaj, Sayfalama, TEHLIKE_DUGME } from "./ortak";

function Rozet({ metin, sinif }: { metin: string; sinif: string }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${sinif}`}>
      {metin}
    </span>
  );
}

function KulupRozetleri({ kulup }: { kulup: KulupOzet }) {
  return (
    <>
      <Rozet
        metin={kulup.isPublic ? "Herkese açık" : "Özel"}
        sinif={kulup.isPublic ? "bg-lime/10 text-lime ring-lime/25" : "bg-soft/10 text-muted ring-soft/25"}
      />
      {kulup.deletedAt ? <Rozet metin="Kapatıldı" sinif="bg-basketbol/10 text-basketbol ring-basketbol/30" /> : null}
      {kulup.isTestFounded ? (
        <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted ring-1 ring-line">
          Test
        </span>
      ) : null}
    </>
  );
}

const GORUNURLUK_FILTRELERI = [
  { deger: "", ad: "Tümü" },
  { deger: "public", ad: "Herkese açık" },
  { deger: "private", ad: "Özel" },
] as const;

function kisiAdi(kisi: { username: string | null; firstName: string | null; lastName: string | null }): string {
  return kisi.username ? `@${kisi.username}` : [kisi.firstName, kisi.lastName].filter(Boolean).join(" ") || "Profil yok";
}

type Props = {
  onKullanici: (id: string) => void;
  onEtkinlik: (id: string) => void;
};

export function Kulupler({ onKullanici, onEtkinlik }: Props) {
  const [arama, setArama] = useState("");
  const [uygulanan, setUygulanan] = useState("");
  const [gorunurluk, setGorunurluk] = useState("");
  const [kapatilanlar, setKapatilanlar] = useState(false);
  const [sayfaNo, setSayfaNo] = useState(1);
  const [sayfa, setSayfa] = useState<Sayfa<KulupOzet> | null>(null);
  const [secili, setSecili] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const sonIstek = useRef(0);

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

  const yukle = useCallback(async () => {
    const no = ++sonIstek.current;
    setHata(null);
    const parametre = new URLSearchParams({
      page: String(sayfaNo),
      pageSize: "25",
      includeDeleted: String(kapatilanlar),
    });
    if (uygulanan) parametre.set("search", uygulanan);
    if (gorunurluk) parametre.set("visibility", gorunurluk);
    try {
      const yeni = await istek<Sayfa<KulupOzet>>(`/api/admin/clubs?${parametre}`);
      if (no !== sonIstek.current) return;
      if (yeni.items.length === 0 && sayfaNo > 1) {
        setSayfaNo(sayfaNo - 1);
        return;
      }
      setSayfa(yeni);
    } catch (error) {
      if (no === sonIstek.current) setHata(mesaj(error));
    }
  }, [sayfaNo, uygulanan, gorunurluk, kapatilanlar]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  return (
    <section>
      {secili ? (
        <KulupDetayi
          id={secili}
          onGeri={() => {
            setSecili(null);
            void yukle();
          }}
          onKullanici={onKullanici}
          onEtkinlik={onEtkinlik}
        />
      ) : null}

      <div className={secili ? "hidden" : ""}>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={arama}
            onChange={(event) => setArama(event.target.value)}
            placeholder="Kulüp adı ya da ID ara"
            className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-2.5 outline-none transition-colors placeholder:text-soft focus:border-lime"
          />
          {GORUNURLUK_FILTRELERI.map((f) => (
            <button
              key={f.ad}
              type="button"
              onClick={() => {
                setSayfaNo(1);
                setGorunurluk(f.deger);
              }}
              className={`rounded-full border px-4 py-2 text-sm font-semibold ${
                gorunurluk === f.deger ? "border-lime text-lime" : "border-line text-muted hover:text-ink"
              }`}
            >
              {f.ad}
            </button>
          ))}
          <label className="flex items-center gap-2 px-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={kapatilanlar}
              onChange={(event) => {
                setSayfaNo(1);
                setKapatilanlar(event.target.checked);
              }}
              className="accent-lime"
            />
            Kapatılanları göster
          </label>
        </div>

        <div className="mt-4">
          <Hata metin={hata} />
        </div>

        <div className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface">
          <ul className="divide-y divide-line">
            {sayfa?.items.map((kulup) => (
              <li key={kulup.id}>
                <button
                  type="button"
                  onClick={() => setSecili(kulup.id)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2/60"
                >
                  <Avatar url={kulup.imageUrl} ad={kulup.name} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold transition-colors group-hover:text-lime">{kulup.name}</span>
                      <KulupRozetleri kulup={kulup} />
                    </span>
                    <span className="mt-1 block truncate text-sm text-soft">
                      {kulup.founder ? `Kurucu: ${kisiAdi(kulup.founder)}` : "Kurucu yok"}
                      {kulup.cityName ? ` · ${kulup.cityName}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-right text-sm text-muted">
                    <span className="font-mono font-semibold">{kulup.memberCount}</span> üye
                    <span className="block text-xs text-soft">{kulup.eventCount} etkinlik</span>
                  </span>
                  <span className="shrink-0 text-soft transition-colors group-hover:text-lime">→</span>
                </button>
              </li>
            ))}
          </ul>
          {sayfa && sayfa.items.length === 0 ? <p className="py-10 text-center text-muted">Kulüp bulunamadı.</p> : null}
        </div>

        {sayfa ? <Sayfalama sayfa={sayfa} onDegis={setSayfaNo} /> : null}
      </div>
    </section>
  );
}

function KulupDetayi({
  id,
  onGeri,
  onKullanici,
  onEtkinlik,
}: {
  id: string;
  onGeri: () => void;
  onKullanici: (id: string) => void;
  onEtkinlik: (id: string) => void;
}) {
  const [detay, setDetay] = useState<KulupDetay | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState(false);
  const [onayIste, onayPenceresi] = useOnay();

  const yukle = useCallback(async () => {
    setHata(null);
    try {
      setDetay(await istek<KulupDetay>(`/api/admin/clubs/${id}`));
    } catch (error) {
      setHata(mesaj(error));
    }
  }, [id]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const calistir = async (is: () => Promise<void>) => {
    setBekliyor(true);
    setHata(null);
    try {
      await is();
      await yukle();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  const gorunurluguDegistir = async () => {
    if (!detay) return;
    const onay = await onayIste({
      baslik: detay.isPublic ? "Kulüp gizlensin mi?" : "Kulüp herkese açılsın mı?",
      metin: detay.isPublic
        ? "Kulüp herkese açık listeden çıkar; üyeler etkilenmez. Geri alınabilir."
        : "Kulüp herkese açık listede görünür olur. Geri alınabilir.",
      onayAd: detay.isPublic ? "Gizle" : "Herkese aç",
    });
    if (!onay) return;
    await calistir(() =>
      istek<void>(`/api/admin/clubs/${id}/visibility`, {
        method: "POST",
        body: JSON.stringify({ isPublic: !detay.isPublic }),
      }),
    );
  };

  const kapat = async () => {
    const onay = await onayIste({
      baslik: "Kulüp kapatılsın mı?",
      metin: "Kulüp silinir, yaklaşan etkinlikleri iptal edilir ve katılımcılara bildirim gider. Geri alınamaz.",
      onayAd: "Kulübü kapat",
      tehlikeli: true,
    });
    if (!onay) return;
    await calistir(() => istek<void>(`/api/admin/clubs/${id}/close`, { method: "POST" }));
  };

  return (
    <div>
      {onayPenceresi}
      <button type="button" onClick={onGeri} className="text-sm text-soft hover:text-ink">
        ← Kulüpler
      </button>

      <div className="mt-4">
        <Hata metin={hata} />
      </div>

      {detay ? (
        <>
          <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3">
                <Avatar url={detay.imageUrl} ad={detay.name} buyuk />
                <h2 className="font-display text-xl font-bold">{detay.name}</h2>
                <KulupRozetleri kulup={detay} />
              </div>

              {detay.description ? (
                <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted">{detay.description}</p>
              ) : null}

              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <Bilgi ad="Oluşturulma" deger={`${tarih(detay.createdAt)} (${gorece(detay.createdAt)})`} />
                {detay.deletedAt ? <Bilgi ad="Kapatılma" deger={tarih(detay.deletedAt)} /> : null}
                <Bilgi ad="Şehir" deger={detay.cityName ?? "—"} />
                <Bilgi ad="Üye sayısı" deger={String(detay.memberCount)} />
                <Bilgi ad="Toplam etkinlik" deger={String(detay.eventCount)} />
                <Bilgi
                  ad="Etkinlik oluşturma"
                  deger={KULUP_ETKINLIK_POLITIKASI[detay.eventCreationPolicy] ?? String(detay.eventCreationPolicy)}
                />
              </dl>

              {detay.founder ? (
                <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-soft">
                  <span>Kurucu:</span>
                  <KullaniciSatiri kisi={detay.founder} onTikla={() => onKullanici(detay.founder!.id)} />
                </div>
              ) : null}

              {!detay.deletedAt ? (
                <div className="mt-6 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={bekliyor}
                    onClick={() => void gorunurluguDegistir()}
                    className={detay.isPublic ? IKINCIL_DUGME : ANA_DUGME}
                  >
                    {detay.isPublic ? "Gizle (özel yap)" : "Herkese aç"}
                  </button>
                  <button type="button" disabled={bekliyor} onClick={() => void kapat()} className={TEHLIKE_DUGME}>
                    Kulübü kapat
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          <h3 className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.18em] text-soft">
            Üyeler ({detay.members.length})
          </h3>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface">
            <ul className="divide-y divide-line">
              {detay.members.map((uye, sira) => (
                <li key={uye.user?.id ?? `uye-${sira}`} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                  <span className="min-w-0 flex-1">
                    {uye.user ? (
                      <KullaniciSatiri kisi={uye.user} onTikla={() => onKullanici(uye.user!.id)} />
                    ) : (
                      <span className="text-sm text-muted">Bilinmeyen kullanıcı</span>
                    )}
                  </span>
                  <span className="text-xs font-semibold text-muted">{KULUP_ROLU[uye.role] ?? uye.role}</span>
                  <span className="text-xs text-soft">{KULUP_UYELIK_DURUMU[uye.status] ?? uye.status}</span>
                  <span className="w-24 text-right text-xs text-soft" title={tarih(uye.joinedAt)}>
                    {uye.joinedAt ? gorece(uye.joinedAt) : "—"}
                  </span>
                </li>
              ))}
            </ul>
            {detay.members.length === 0 ? <p className="py-10 text-center text-muted">Üye yok.</p> : null}
          </div>

          <h3 className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.18em] text-soft">Son etkinlikler</h3>
          <div className="overflow-hidden rounded-3xl border border-line bg-surface">
            <ul className="divide-y divide-line">
              {detay.recentEvents.map((etkinlik) => (
                <li key={etkinlik.id}>
                  <button
                    type="button"
                    onClick={() => onEtkinlik(etkinlik.id)}
                    className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-surface-2/60"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold transition-colors group-hover:text-lime">
                      {etkinlik.title}
                    </span>
                    <EtkinlikDurumu durum={etkinlik.status} />
                    <span className="text-xs text-soft">{tarih(etkinlik.eventDate)}</span>
                  </button>
                </li>
              ))}
            </ul>
            {detay.recentEvents.length === 0 ? <p className="py-10 text-center text-muted">Etkinlik yok.</p> : null}
          </div>
        </>
      ) : hata ? null : (
        <p className="py-10 text-center text-muted">Yükleniyor…</p>
      )}
    </div>
  );
}
