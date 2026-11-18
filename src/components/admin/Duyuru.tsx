"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  DUYURU_BASLIK_MAX,
  DUYURU_METIN_MAX,
  istek,
  type DuyuruOnizleme,
  type DuyuruSecenekleri,
  type DuyuruSonucu,
} from "@/lib/admin/api";

import { useOnay } from "./Onay";
import { ANA_DUGME, Hata, IKINCIL_DUGME, mesaj } from "./ortak";

/** Hesaplanan alıcı sayısının hangi form değerlerine ait olduğu; form değişirse sayı geçersizleşir. */
type Hesaplanan = { baslik: string; metin: string; sehir: string; sporId: string; sayi: number };

const ALAN = "w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm outline-none focus:border-lime";

export function Duyuru() {
  const [secenekler, setSecenekler] = useState<DuyuruSecenekleri | null>(null);
  const [baslik, setBaslik] = useState("");
  const [metin, setMetin] = useState("");
  const [sehir, setSehir] = useState("");
  const [sporId, setSporId] = useState("");
  const [hesaplanan, setHesaplanan] = useState<Hesaplanan | null>(null);
  const [hesapliyor, setHesapliyor] = useState(false);
  const [gonderiyor, setGonderiyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [basari, setBasari] = useState<string | null>(null);
  const [onayIste, onayPenceresi] = useOnay();

  const sonIstek = useRef(0);

  useEffect(() => {
    istek<DuyuruSecenekleri>("/api/admin/announcements/options")
      .then(setSecenekler)
      .catch((error: unknown) => setHata(mesaj(error)));
  }, []);

  const temizBaslik = baslik.trim();
  const temizMetin = metin.trim();
  const formGecerli =
    temizBaslik.length >= 1 &&
    temizBaslik.length <= DUYURU_BASLIK_MAX &&
    temizMetin.length >= 1 &&
    temizMetin.length <= DUYURU_METIN_MAX;

  // Sayı yalnızca hesaplandığı andaki form değerleriyle birebir eşleşiyorsa geçerli.
  const sayi =
    hesaplanan &&
    hesaplanan.baslik === temizBaslik &&
    hesaplanan.metin === temizMetin &&
    hesaplanan.sehir === sehir &&
    hesaplanan.sporId === sporId
      ? hesaplanan.sayi
      : null;

  const mesgul = hesapliyor || gonderiyor;

  const govde = (ek?: object) => ({
    title: temizBaslik,
    body: temizMetin,
    city: sehir || null,
    sportId: sporId || null,
    ...ek,
  });

  const hesapla = useCallback(async () => {
    const no = ++sonIstek.current;
    setHesapliyor(true);
    setHata(null);
    setBasari(null);
    const anlik = { baslik: temizBaslik, metin: temizMetin, sehir, sporId };
    try {
      const yanit = await istek<DuyuruOnizleme>("/api/admin/announcements/preview", {
        method: "POST",
        body: JSON.stringify({
          title: anlik.baslik,
          body: anlik.metin,
          city: anlik.sehir || null,
          sportId: anlik.sporId || null,
        }),
      });
      if (no !== sonIstek.current) return;
      setHesaplanan({ ...anlik, sayi: yanit.recipientCount });
    } catch (error) {
      if (no === sonIstek.current) {
        setHesaplanan(null);
        setHata(mesaj(error));
      }
    } finally {
      if (no === sonIstek.current) setHesapliyor(false);
    }
  }, [temizBaslik, temizMetin, sehir, sporId]);

  const gonder = async () => {
    if (sayi === null || sayi < 1 || mesgul) return;
    const n = sayi;
    // Onay penceresi açıkken form ve düğmeler kilitli kalsın.
    setGonderiyor(true);
    const onay = await onayIste({
      baslik: "Duyuru gönderilsin mi?",
      metin: (
        <>
          <p>{n} kişiye push bildirimi gönderilecek. Geri alınamaz.</p>
          <div className="mt-3 rounded-2xl border border-line bg-bg p-3">
            <p className="font-semibold text-ink">{temizBaslik}</p>
            <p className="mt-1 whitespace-pre-line">{temizMetin}</p>
          </div>
        </>
      ),
      onayAd: `${n} kişiye gönder`,
      tehlikeli: true,
    });
    if (!onay) {
      setGonderiyor(false);
      return;
    }

    sonIstek.current++;
    setHata(null);
    setBasari(null);
    try {
      const sonuc = await istek<DuyuruSonucu>("/api/admin/announcements", {
        method: "POST",
        body: JSON.stringify(govde({ expectedRecipientCount: n })),
      });
      setBasari(`${sonuc.sentCount} kişiye gönderildi.`);
      setBaslik("");
      setMetin("");
      setSehir("");
      setSporId("");
      setHesaplanan(null);
    } catch (error) {
      setHesaplanan(null);
      setHata(mesaj(error));
    } finally {
      setGonderiyor(false);
    }
  };

  return (
    <section>
      {onayPenceresi}

      <p className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
        Duyurular yalnızca uygulamada &apos;Duyurular ve kampanyalar&apos; bildirimini açan kullanıcılara gider. Test
        hesaplarına ve banlı hesaplara gitmez.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="rounded-3xl border border-line bg-surface p-6">
          <div className="flex items-baseline justify-between">
            <label htmlFor="duyuru-baslik" className="text-sm font-semibold">
              Başlık
            </label>
            <span className="font-mono text-xs text-soft">
              {baslik.length}/{DUYURU_BASLIK_MAX}
            </span>
          </div>
          <input
            id="duyuru-baslik"
            value={baslik}
            maxLength={DUYURU_BASLIK_MAX}
            disabled={gonderiyor}
            onChange={(event) => setBaslik(event.target.value)}
            className={`mt-2 ${ALAN}`}
          />

          <div className="mt-5 flex items-baseline justify-between">
            <label htmlFor="duyuru-metin" className="text-sm font-semibold">
              Metin
            </label>
            <span className="font-mono text-xs text-soft">
              {metin.length}/{DUYURU_METIN_MAX}
            </span>
          </div>
          <textarea
            id="duyuru-metin"
            value={metin}
            rows={4}
            maxLength={DUYURU_METIN_MAX}
            disabled={gonderiyor}
            onChange={(event) => setMetin(event.target.value)}
            className={`mt-2 leading-relaxed ${ALAN}`}
          />

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="duyuru-sehir" className="text-sm font-semibold">
                Şehir
              </label>
              <select
                id="duyuru-sehir"
                value={sehir}
                disabled={gonderiyor}
                onChange={(event) => setSehir(event.target.value)}
                className={`mt-2 ${ALAN}`}
              >
                <option value="">Tümü</option>
                {secenekler?.cities.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="duyuru-spor" className="text-sm font-semibold">
                Spor
              </label>
              <select
                id="duyuru-spor"
                value={sporId}
                disabled={gonderiyor}
                onChange={(event) => setSporId(event.target.value)}
                className={`mt-2 ${ALAN}`}
              >
                <option value="">Tümü</option>
                {secenekler?.sports.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <Hata metin={hata} />
            {basari ? (
              <p className="rounded-xl border border-lime/40 bg-lime/10 px-4 py-3 text-sm text-lime">{basari}</p>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={mesgul || !formGecerli}
              onClick={() => void hesapla()}
              className={IKINCIL_DUGME}
            >
              {hesapliyor ? "Hesaplanıyor…" : "Alıcıları hesapla"}
            </button>
            <button
              type="button"
              disabled={mesgul || sayi === null || sayi < 1 || !formGecerli}
              onClick={() => void gonder()}
              className={ANA_DUGME}
            >
              {gonderiyor ? "Gönderiliyor…" : "Gönder"}
            </button>
            {sayi !== null ? (
              sayi > 0 ? (
                <span className="text-sm font-semibold">Bu duyuru {sayi} kişiye gidecek</span>
              ) : (
                <span className="text-sm text-basketbol">Bu filtreyle izin veren kullanıcı yok</span>
              )
            ) : null}
          </div>
        </div>

        <div>
          <p className="mb-3 font-mono text-xs uppercase tracking-[0.18em] text-soft">Önizleme</p>
          <div className="rounded-3xl border border-line bg-surface-2 p-4">
            <div className="rounded-2xl bg-bg p-3.5 ring-1 ring-line">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="" width={18} height={18} className="size-[18px] rounded-md" />
                <span className="text-[0.7rem] font-semibold uppercase tracking-wide text-soft">Sportner</span>
                <span className="ml-auto text-[0.7rem] text-soft">şimdi</span>
              </div>
              <p className="mt-2 break-words text-sm font-semibold">{temizBaslik || "Başlık"}</p>
              <p className="mt-0.5 whitespace-pre-line break-words text-sm leading-snug text-muted">
                {temizMetin || "Duyuru metni burada görünecek."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
