"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  gorece,
  ICERIK_DURUMU,
  istek,
  SIKAYET_DURUMU,
  SIKAYET_TURU,
  tarih,
  type IcerikDurumu,
  type IcerikKaydi,
  type KullaniciRef,
  type Sayfa,
  type SikayetKaydi,
} from "@/lib/admin/api";

import { useOnay } from "./Onay";
import { Avatar, Hata, mesaj, Sayfalama } from "./ortak";

// ---------------------------------------------------------------- Ortak parçalar

function kullaniciAdi(ref: KullaniciRef): { ad: string; avatarAd: string } {
  const isim = [ref.firstName, ref.lastName].filter(Boolean).join(" ");
  return {
    ad: ref.username ? `@${ref.username}` : isim || "Profil yok",
    avatarAd: isim || ref.username || "?",
  };
}

function DurumEtiketi({ durum }: { durum: IcerikDurumu }) {
  const bilgi = ICERIK_DURUMU[durum];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${bilgi?.rozet ?? ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {bilgi?.ad ?? durum}
    </span>
  );
}

function KullaniciSatiri({ kisi, onTikla }: { kisi: KullaniciRef; onTikla?: () => void }) {
  const { ad, avatarAd } = kullaniciAdi(kisi);
  const icerik = (
    <>
      <Avatar url={kisi.profileImageUrl} ad={avatarAd} />
      <span className="min-w-0 truncate text-sm font-semibold">{ad}</span>
    </>
  );
  return onTikla ? (
    <button
      type="button"
      onClick={onTikla}
      className="flex min-w-0 items-center gap-2.5 text-left transition-colors hover:text-lime"
    >
      {icerik}
    </button>
  ) : (
    <span className="flex min-w-0 items-center gap-2.5">{icerik}</span>
  );
}

function Kucukgorsel({ url }: { url: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- statik dışa aktarımda next/image optimize etmiyor
  return <img src={url} alt="" className="size-16 shrink-0 rounded-xl object-cover ring-1 ring-line" />;
}

const IKINCIL_DUGME = "rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-ink disabled:opacity-50";
const ANA_DUGME = "rounded-full bg-lime px-4 py-2 text-sm font-semibold text-bg disabled:opacity-50";
const TEHLIKE_DUGME =
  "rounded-full border border-basketbol/50 px-4 py-2 text-sm font-semibold text-basketbol hover:bg-basketbol/10 disabled:opacity-50";

// ---------------------------------------------------------------- Şikâyetler sekmesi

const DURUM_FILTRELERI = [
  { deger: "0", ad: "Bekliyor" },
  { deger: "1", ad: "İnceleniyor" },
  { deger: "2", ad: "Çözüldü" },
  { deger: "3", ad: "Reddedildi" },
  { deger: "", ad: "Tümü" },
] as const;

export function Sikayetler({ onKullanici }: { onKullanici: (id: string) => void }) {
  const [durum, setDurum] = useState<string>("0");
  const [tur, setTur] = useState<string>("");
  const [sayfaNo, setSayfaNo] = useState(1);
  const [sayfa, setSayfa] = useState<Sayfa<SikayetKaydi> | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const sonIstek = useRef(0);

  const yukle = useCallback(async () => {
    const no = ++sonIstek.current;
    setHata(null);
    const parametre = new URLSearchParams({ page: String(sayfaNo), pageSize: "20" });
    if (durum) parametre.set("status", durum);
    if (tur) parametre.set("entityType", tur);
    try {
      const yeni = await istek<Sayfa<SikayetKaydi>>(`/api/admin/reports?${parametre}`);
      if (no !== sonIstek.current) return;
      // İşlemden sonra bu sayfa boşaldıysa önceki sayfaya dön (efekt yeniden yükler).
      if (yeni.items.length === 0 && sayfaNo > 1) {
        setSayfaNo(sayfaNo - 1);
        return;
      }
      setSayfa(yeni);
    } catch (error) {
      if (no === sonIstek.current) setHata(mesaj(error));
    }
  }, [sayfaNo, durum, tur]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  return (
    <section>
      <div className="flex flex-wrap items-center gap-2">
        {DURUM_FILTRELERI.map((f) => (
          <button
            key={f.ad}
            type="button"
            onClick={() => {
              setSayfaNo(1);
              setDurum(f.deger);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              durum === f.deger ? "border-lime text-lime" : "border-line text-muted hover:text-ink"
            }`}
          >
            {f.ad}
          </button>
        ))}
        <select
          value={tur}
          onChange={(event) => {
            setSayfaNo(1);
            setTur(event.target.value);
          }}
          className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm sm:ml-auto"
          aria-label="Tür"
        >
          <option value="">Tüm türler</option>
          {Object.entries(SIKAYET_TURU).map(([deger, ad]) => (
            <option key={deger} value={deger}>
              {ad}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        <Hata metin={hata} />
      </div>

      <div className="mt-2 flex flex-col gap-3">
        {sayfa?.items.map((kayit) => (
          <SikayetKarti key={kayit.id} kayit={kayit} onDegisti={() => void yukle()} onKullanici={onKullanici} />
        ))}
      </div>

      {sayfa && sayfa.items.length === 0 ? <p className="py-10 text-center text-muted">Burada bir şey yok.</p> : null}
      {sayfa ? <Sayfalama sayfa={sayfa} onDegis={setSayfaNo} /> : null}
    </section>
  );
}

/** Çözülünce hedefe ne olacağını söyler (API'nin davranışı). */
function cozumAciklamasi(entityType: number): string {
  if (entityType === 2 || entityType === 3) return "İçerik gizlenir.";
  if (entityType === 5) return "Mesaj içeriği silinir.";
  if (entityType === 4) return "Değerlendirme işaretlenir.";
  return "Hedefe dokunulmaz.";
}

function SikayetKarti({
  kayit,
  onDegisti,
  onKullanici,
}: {
  kayit: SikayetKaydi;
  onDegisti: () => void;
  onKullanici: (id: string) => void;
}) {
  const [mod, setMod] = useState<"coz" | "reddet" | null>(null);
  const [not, setNot] = useState("");
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [onayIste, onayPenceresi] = useOnay();

  const hedef = kayit.target;
  const acik = kayit.status === 0 || kayit.status === 1;
  const durumBilgi = SIKAYET_DURUMU[kayit.status];
  const icerikMi = kayit.entityType === 2 || kayit.entityType === 3;
  const yol = kayit.entityType === 2 ? "posts" : "comments";

  const calistir = async (is: () => Promise<void>) => {
    setBekliyor(true);
    setHata(null);
    try {
      await is();
      onDegisti();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  const sonuclandir = async () => {
    if (mod === "coz" && kayit.entityType === 5) {
      const onay = await onayIste({
        baslik: "Şikâyet çözülsün mü?",
        metin: "Mesaj içeriği kalıcı olarak silinir. Geri alınamaz.",
        onayAd: "Çöz ve sil",
        tehlikeli: true,
      });
      if (!onay) return;
    }
    await calistir(async () => {
      await istek<void>(`/api/admin/reports/${kayit.id}/${mod === "coz" ? "resolve" : "reject"}`, {
        method: "POST",
        body: JSON.stringify({ note: not.trim() }),
      });
      setMod(null);
      setNot("");
    });
  };

  const gizleDegistir = async () => {
    const gizle = hedef.state !== "hidden";
    const nesne = kayit.entityType === 2 ? "Gönderi" : "Yorum";
    const onay = await onayIste({
      baslik: gizle ? `${nesne} gizlensin mi?` : `${nesne} geri açılsın mı?`,
      metin: gizle ? `${nesne} kullanıcılara görünmez olacak.` : `${nesne} kullanıcılara tekrar görünür olacak.`,
      onayAd: gizle ? "Gizle" : "Geri aç",
      tehlikeli: gizle,
    });
    if (!onay) return;
    await calistir(() =>
      istek<void>(`/api/admin/${yol}/${kayit.entityId}/${gizle ? "hide" : "unhide"}`, { method: "POST" }),
    );
  };

  const etkinligiIptalEt = async () => {
    const onay = await onayIste({
      baslik: "Etkinlik iptal edilsin mi?",
      metin: "Katılımcılara iptal bildirimi gider. Geri alınamaz.",
      onayAd: "Etkinliği iptal et",
      tehlikeli: true,
    });
    if (!onay) return;
    await calistir(() => istek<void>(`/api/admin/events/${kayit.entityId}/cancel`, { method: "POST" }));
  };

  return (
    <article className="rounded-3xl border border-line bg-surface p-5">
      {onayPenceresi}

      <header className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-surface-2 px-2 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted ring-1 ring-line">
          {SIKAYET_TURU[kayit.entityType] ?? `Tür ${kayit.entityType}`}
        </span>
        <span className="font-semibold">{kayit.reasonName ?? kayit.reasonCode ?? "Neden belirtilmemiş"}</span>
        {kayit.openReportsOnTarget > 1 ? (
          <span className="rounded-full bg-basketbol/10 px-2.5 py-1 text-xs font-semibold text-basketbol ring-1 ring-basketbol/30">
            {kayit.openReportsOnTarget} şikâyet
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${durumBilgi?.rozet ?? ""}`}
          >
            {durumBilgi?.ad ?? kayit.status}
          </span>
          <span className="text-xs text-soft" title={tarih(kayit.createdAt)}>
            {gorece(kayit.createdAt)}
          </span>
        </span>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-soft">
        <span>Şikâyet eden:</span>
        {kayit.reporter ? (
          <KullaniciSatiri kisi={kayit.reporter} onTikla={() => onKullanici(kayit.reporter!.id)} />
        ) : (
          <span className="text-muted">Bilinmiyor</span>
        )}
      </div>

      {kayit.description ? (
        <p className="mt-3 whitespace-pre-line leading-relaxed">{kayit.description}</p>
      ) : null}

      <div className="mt-4 rounded-2xl border border-line bg-bg p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-soft">Şikâyet edilen</p>
          <DurumEtiketi durum={hedef.state} />
        </div>
        {hedef.owner ? (
          <div className="mt-3">
            <KullaniciSatiri kisi={hedef.owner} />
          </div>
        ) : null}
        <div className="mt-3 flex gap-3">
          {hedef.imageUrl ? <Kucukgorsel url={hedef.imageUrl} /> : null}
          <p className="min-w-0 flex-1 whitespace-pre-line text-sm leading-relaxed text-muted">
            {kayit.entityType === 5
              ? "Mesaj içeriği gizlilik nedeniyle gösterilmez"
              : (hedef.preview ?? (hedef.exists ? "Önizleme yok" : "Hedef silinmiş"))}
          </p>
        </div>
      </div>

      {!acik ? (
        <div className="mt-4 rounded-2xl border border-line bg-surface-2 p-4">
          <p className="text-xs text-soft">Karar · {tarih(kayit.reviewedAt)}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-muted">{kayit.resolutionNote ?? "Not yok."}</p>
        </div>
      ) : null}

      {hata ? <p className="mt-3 text-sm text-basketbol">{hata}</p> : null}

      {acik ? (
        mod ? (
          <div className="mt-4">
            <textarea
              value={not}
              onChange={(event) => setNot(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder={mod === "coz" ? "Çözüm notu (zorunlu)" : "Reddetme notu (zorunlu)"}
              className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm leading-relaxed outline-none focus:border-lime"
            />
            <p className="mt-1 text-xs text-soft">
              {mod === "coz" ? `Çözülünce: ${cozumAciklamasi(kayit.entityType)}` : "Reddedilince hedefe dokunulmaz."}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={bekliyor || !not.trim()}
                onClick={() => void sonuclandir()}
                className={ANA_DUGME}
              >
                {bekliyor ? "Bekle…" : mod === "coz" ? "Çöz" : "Reddet"}
              </button>
              <button
                type="button"
                onClick={() => setMod(null)}
                className="rounded-full px-4 text-sm text-soft hover:text-ink"
              >
                Vazgeç
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" disabled={bekliyor} onClick={() => setMod("coz")} className={ANA_DUGME}>
              Çöz
            </button>
            <button type="button" disabled={bekliyor} onClick={() => setMod("reddet")} className={IKINCIL_DUGME}>
              Reddet
            </button>
            {kayit.entityType === 1 && hedef.state === "active" ? (
              <button type="button" disabled={bekliyor} onClick={() => void etkinligiIptalEt()} className={TEHLIKE_DUGME}>
                Etkinliği iptal et
              </button>
            ) : null}
            {icerikMi && hedef.exists && (hedef.state === "hidden" || hedef.state === "active") ? (
              <button type="button" disabled={bekliyor} onClick={() => void gizleDegistir()} className={IKINCIL_DUGME}>
                {hedef.state === "hidden" ? "Geri aç" : "Gizle"}
              </button>
            ) : null}
            {hedef.owner ? (
              <button
                type="button"
                onClick={() => onKullanici(hedef.owner!.id)}
                className="rounded-full px-4 py-2 text-sm text-soft hover:text-ink"
              >
                Sahibine git →
              </button>
            ) : null}
          </div>
        )
      ) : hedef.owner ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onKullanici(hedef.owner!.id)}
            className="rounded-full px-1 py-2 text-sm text-soft hover:text-ink"
          >
            Sahibine git →
          </button>
        </div>
      ) : null}
    </article>
  );
}

// ---------------------------------------------------------------- Kullanıcı içerikleri

const ICERIK_SEKMELERI = [
  { id: "posts", ad: "Gönderiler" },
  { id: "comments", ad: "Yorumlar" },
  { id: "events", ad: "Etkinlikler" },
] as const;

/** IcerikKaydi.type -> uç yolu (1 etkinlik, 2 gönderi, 3 yorum). */
const ICERIK_YOLU: Record<number, "events" | "posts" | "comments"> = { 1: "events", 2: "posts", 3: "comments" };

type IcerikTuru = (typeof ICERIK_SEKMELERI)[number]["id"];

export function IcerikBolumu({ kullaniciId }: { kullaniciId: string }) {
  const [tur, setTur] = useState<IcerikTuru>("posts");
  const [sayfaNo, setSayfaNo] = useState(1);
  const [sayfa, setSayfa] = useState<Sayfa<IcerikKaydi> | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [bekliyor, setBekliyor] = useState<string | null>(null);
  const [onayIste, onayPenceresi] = useOnay();

  const sonIstek = useRef(0);

  const yukle = useCallback(async () => {
    const no = ++sonIstek.current;
    setHata(null);
    const parametre = new URLSearchParams({ type: tur, page: String(sayfaNo), pageSize: "10" });
    try {
      const yeni = await istek<Sayfa<IcerikKaydi>>(`/api/admin/users/${kullaniciId}/content?${parametre}`);
      if (no !== sonIstek.current) return;
      if (yeni.items.length === 0 && sayfaNo > 1) {
        setSayfaNo(sayfaNo - 1);
        return;
      }
      setSayfa(yeni);
    } catch (error) {
      if (no === sonIstek.current) setHata(mesaj(error));
    }
  }, [kullaniciId, tur, sayfaNo]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const calistir = async (id: string, is: () => Promise<void>) => {
    setBekliyor(id);
    setHata(null);
    try {
      await is();
      await yukle();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(null);
    }
  };

  const gizleDegistir = async (kayit: IcerikKaydi) => {
    const gizle = kayit.state !== "hidden";
    const yolAdi = ICERIK_YOLU[kayit.type];
    if (yolAdi !== "posts" && yolAdi !== "comments") return;
    const nesne = yolAdi === "posts" ? "Gönderi" : "Yorum";
    const onay = await onayIste({
      baslik: gizle ? `${nesne} gizlensin mi?` : `${nesne} geri açılsın mı?`,
      metin: gizle ? `${nesne} kullanıcılara görünmez olacak.` : `${nesne} kullanıcılara tekrar görünür olacak.`,
      onayAd: gizle ? "Gizle" : "Geri aç",
      tehlikeli: gizle,
    });
    if (!onay) return;
    await calistir(kayit.id, () =>
      istek<void>(`/api/admin/${yolAdi}/${kayit.id}/${gizle ? "hide" : "unhide"}`, { method: "POST" }),
    );
  };

  const iptalEt = async (kayit: IcerikKaydi) => {
    const onay = await onayIste({
      baslik: "Etkinlik iptal edilsin mi?",
      metin: "Katılımcılara iptal bildirimi gider. Geri alınamaz.",
      onayAd: "Etkinliği iptal et",
      tehlikeli: true,
    });
    if (!onay) return;
    await calistir(kayit.id, () => istek<void>(`/api/admin/events/${kayit.id}/cancel`, { method: "POST" }));
  };

  return (
    <div className="mt-8">
      {onayPenceresi}
      <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-soft">İçerikleri</h3>

      <div className="flex flex-wrap gap-2">
        {ICERIK_SEKMELERI.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSayfaNo(1);
              setSayfa(null);
              setTur(s.id);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              tur === s.id ? "border-lime text-lime" : "border-line text-muted hover:text-ink"
            }`}
          >
            {s.ad}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Hata metin={hata} />
      </div>

      <div className="mt-2 overflow-hidden rounded-3xl border border-line bg-surface">
        <ul className="divide-y divide-line">
          {sayfa?.items.map((kayit) => (
            <li key={kayit.id} className="flex flex-wrap items-center gap-4 px-5 py-4">
              {kayit.imageUrl ? <Kucukgorsel url={kayit.imageUrl} /> : null}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-3 whitespace-pre-line text-sm leading-relaxed">
                  {kayit.preview ?? "Önizleme yok"}
                </p>
                <p className="mt-1 text-xs text-soft">
                  <span title={tarih(kayit.createdAt)}>{gorece(kayit.createdAt)}</span>
                  {ICERIK_YOLU[kayit.type] === "events" && kayit.eventDate ? <> · Etkinlik tarihi: {tarih(kayit.eventDate)}</> : null}
                </p>
              </div>
              <DurumEtiketi durum={kayit.state} />
              {(ICERIK_YOLU[kayit.type] === "posts" || ICERIK_YOLU[kayit.type] === "comments") &&
              (kayit.state === "active" || kayit.state === "hidden") ? (
                <button
                  type="button"
                  disabled={bekliyor === kayit.id}
                  onClick={() => void gizleDegistir(kayit)}
                  className={IKINCIL_DUGME}
                >
                  {kayit.state === "hidden" ? "Geri aç" : "Gizle"}
                </button>
              ) : null}
              {ICERIK_YOLU[kayit.type] === "events" && kayit.state === "active" ? (
                <button
                  type="button"
                  disabled={bekliyor === kayit.id}
                  onClick={() => void iptalEt(kayit)}
                  className={TEHLIKE_DUGME}
                >
                  İptal et
                </button>
              ) : null}
            </li>
          ))}
        </ul>
        {sayfa && sayfa.items.length === 0 ? <p className="py-10 text-center text-muted">İçerik yok.</p> : null}
      </div>

      {sayfa ? <Sayfalama sayfa={sayfa} onDegis={setSayfaNo} /> : null}
    </div>
  );
}
