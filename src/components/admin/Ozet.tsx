"use client";

import { useEffect, useState } from "react";

import { istek, type Ozet as OzetVerisi } from "@/lib/admin/api";

import { Hata, mesaj } from "./ortak";

type SekmeAdi = "sikayetler" | "geri-bildirim";

const sayi = (deger: number) => new Intl.NumberFormat("tr-TR").format(deger);

function Kart({ baslik, children }: { baslik: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-soft">{baslik}</p>
      {children}
    </div>
  );
}

function Satir({ ad, deger }: { ad: string; deger: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted">{ad}</span>
      <span className="font-mono font-semibold">{sayi(deger)}</span>
    </div>
  );
}

function Buyuk({ deger, etiket }: { deger: number; etiket: string }) {
  return (
    <p className="mt-2 flex items-baseline gap-2">
      <span className="font-display text-4xl font-bold">{sayi(deger)}</span>
      <span className="text-sm text-soft">{etiket}</span>
    </p>
  );
}

function BekleyenKart({ baslik, deger, onTikla }: { baslik: string; deger: number; onTikla: () => void }) {
  const vurgulu = deger > 0;
  return (
    <button
      type="button"
      onClick={onTikla}
      className={`rounded-3xl border p-5 text-left transition-colors ${
        vurgulu
          ? "border-basketbol/40 bg-basketbol/10 hover:bg-basketbol/15"
          : "border-line bg-surface hover:bg-surface-2"
      }`}
    >
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-soft">{baslik}</p>
      <p className={`mt-2 font-display text-4xl font-bold ${vurgulu ? "text-basketbol" : ""}`}>{sayi(deger)}</p>
      <p className="mt-1 text-sm text-soft">Görüntüle →</p>
    </button>
  );
}

function KayitGrafigi({ gunler }: { gunler: OzetVerisi["signupsByDay"] }) {
  const enCok = Math.max(1, ...gunler.map((g) => g.count));
  const bicim = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="rounded-3xl border border-line bg-surface p-5">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.16em] text-soft">Günlük kayıt · son 30 gün</p>
      <div className="mt-4 flex h-40 items-end gap-1" role="img" aria-label="Son 30 günün günlük kayıt grafiği">
        {gunler.map((gun) => (
          <div
            key={gun.date}
            title={`${bicim.format(new Date(`${gun.date}T00:00:00`))}: ${gun.count} kayıt`}
            className="flex h-full flex-1 items-end"
          >
            <div
              className="w-full rounded-t bg-lime/70 transition-colors hover:bg-lime"
              style={{ height: `${gun.count === 0 ? 2 : Math.max(4, (gun.count / enCok) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[0.68rem] text-soft">
        <span>{gunler[0] ? bicim.format(new Date(`${gunler[0].date}T00:00:00`)) : ""}</span>
        <span>en yüksek: {sayi(enCok)}</span>
        <span>
          {gunler.length ? bicim.format(new Date(`${gunler[gunler.length - 1].date}T00:00:00`)) : ""}
        </span>
      </div>
    </div>
  );
}

export function Ozet({ onSekme }: { onSekme: (sekme: SekmeAdi) => void }) {
  const [veri, setVeri] = useState<OzetVerisi | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  useEffect(() => {
    let iptal = false;
    istek<OzetVerisi>("/api/admin/stats")
      .then((yeni) => {
        if (!iptal) setVeri(yeni);
      })
      .catch((error: unknown) => {
        if (!iptal) setHata(mesaj(error));
      });
    return () => {
      iptal = true;
    };
  }, []);

  if (!veri) {
    return hata ? <Hata metin={hata} /> : <p className="py-10 text-center text-muted">Yükleniyor…</p>;
  }

  return (
    <section>
      <div className="grid gap-4 sm:grid-cols-2">
        <BekleyenKart baslik="Bekleyen şikâyet" deger={veri.pending.reports} onTikla={() => onSekme("sikayetler")} />
        <BekleyenKart baslik="Yeni geri bildirim" deger={veri.pending.feedback} onTikla={() => onSekme("geri-bildirim")} />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Kart baslik="Kullanıcılar">
          <Buyuk deger={veri.users.total} etiket="toplam" />
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-soft">Yeni</p>
              <Satir ad="Son 24 saat" deger={veri.users.new24h} />
              <Satir ad="Son 7 gün" deger={veri.users.new7d} />
              <Satir ad="Son 30 gün" deger={veri.users.new30d} />
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-soft">Aktif</p>
              <Satir ad="Son 24 saat" deger={veri.users.active24h} />
              <Satir ad="Son 7 gün" deger={veri.users.active7d} />
              <Satir ad="Son 30 gün" deger={veri.users.active30d} />
            </div>
          </div>
        </Kart>

        <Kart baslik="Etkinlikler">
          <Buyuk deger={veri.events.upcoming} etiket="yaklaşan" />
          <div className="mt-4 flex flex-col gap-1.5">
            <Satir ad="Son 7 günde oluşturulan" deger={veri.events.created7d} />
            <Satir ad="Son 7 günde tamamlanan" deger={veri.events.completed7d} />
            <Satir ad="Son 7 günde iptal edilen" deger={veri.events.cancelled7d} />
          </div>
        </Kart>

        <Kart baslik="Kulüpler">
          <Buyuk deger={veri.clubs.total} etiket="toplam" />
          <div className="mt-4 flex flex-col gap-1.5">
            <Satir ad="Son 7 günde yeni" deger={veri.clubs.new7d} />
          </div>
        </Kart>

        <Kart baslik="Gönderiler">
          <Buyuk deger={veri.posts.new7d} etiket="son 7 günde" />
        </Kart>
      </div>

      <div className="mt-4">
        <KayitGrafigi gunler={veri.signupsByDay} />
      </div>

      <p className="mt-4 text-xs text-soft">
        Test hesapları sayılara dahil değil (bekleyen şikâyet ve geri bildirim hariç). Aktiflik son giriş/oturum yenileme zamanına göre.
      </p>
    </section>
  );
}
