/**
 * Telefon ekranlarinin DOM karsiliklari.
 *
 * Her ekran, kendisini saran sahneden miras alinan `--p` (0–1 ilerleme)
 * degerine gore canlaniyor; elemanlar `girer` + bir hareket yardimci sinifiyla
 * kendi gecikmesini bildiriyor (bkz. app/globals.css > "Ekran ici animasyon
 * motoru"). Olculer `cqw` cinsinden — 390pt tasarimda 1cqw = 3.9px.
 */
import {
  Avatar,
  AvatarYigini,
  DurumCubugu,
  KontenjanCubugu,
  Meta,
  Rozet,
  SekmeCubugu,
  Simge,
  SoluRozet,
  UygulamaBasligi,
  zamanStili,
} from "./parcalar";

const AKSAN = {
  basketbol: "#ff6b1a",
  kosu: "#42a5ff",
  voleybol: "#9a72ff",
  lime: "#ccff00",
  turkuaz: "#5eead4",
} as const;

/* ========================================================================== */
/* 1 — Etkinlik listesi                                                        */
/* ========================================================================== */

export function EkranListe() {
  return (
    <div className="relative size-full bg-bg text-white">
      <DurumCubugu saat="10:36" />

      <UygulamaBasligi
        className="girer yukselir mt-[3.1cqw]"
        style={zamanStili({ gecikme: 0, sure: 0.3 })}
      />

      <div className="mt-[4.6cqw] px-[4.6cqw]">
        <span
          className="girer soldan flex items-center gap-[1.8cqw] text-[3.6cqw] font-semibold"
          style={zamanStili({ gecikme: 0.06, sure: 0.3 })}
        >
          <span className="block size-[4.1cqw] text-lime">
            <Simge.Konum />
          </span>
          Konuma göre
          <span className="text-[3.1cqw] text-white/45">⇅</span>
        </span>

        {/* Genel / Arkadaşlarım */}
        <div
          className="girer yukselir relative mt-[3.1cqw] flex h-[12cqw] items-center rounded-full border border-white/10 bg-white/[0.04] p-[1cqw]"
          style={zamanStili({ gecikme: 0.1, sure: 0.3 })}
        >
          <span
            className="girer belirir absolute left-[1cqw] top-[1cqw] h-[10cqw] w-[48.5%] rounded-full bg-lime"
            style={zamanStili({ gecikme: 0.18, sure: 0.25 })}
          />
          <span className="relative z-10 flex w-1/2 justify-center text-[3.85cqw] font-semibold text-bg">
            Genel
          </span>
          <span className="relative z-10 flex w-1/2 justify-center text-[3.85cqw] font-semibold text-white/45">
            Arkadaşlarım
          </span>
        </div>

        {/* Liste / Harita + Filtrele */}
        <div
          className="girer yukselir mt-[2.8cqw] flex items-center justify-between"
          style={zamanStili({ gecikme: 0.14, sure: 0.3 })}
        >
          <span className="flex h-[10.5cqw] items-center rounded-full border border-white/10 bg-white/[0.04] p-[0.9cqw]">
            <span className="flex h-[8.7cqw] items-center gap-[1.5cqw] rounded-full bg-lime px-[3.3cqw] text-[3.3cqw] font-semibold text-bg">
              <span className="block size-[3.6cqw]">
                <Simge.Liste />
              </span>
              Liste
            </span>
            <span className="flex h-[8.7cqw] items-center gap-[1.5cqw] rounded-full px-[3.3cqw] text-[3.3cqw] font-medium text-white/45">
              <span className="block size-[3.6cqw]">
                <Simge.Harita />
              </span>
              Harita
            </span>
          </span>

          <span className="flex h-[10.5cqw] items-center gap-[1.8cqw] rounded-full border border-white/10 bg-white/[0.04] px-[4.1cqw] text-[3.3cqw] font-semibold">
            <span className="block size-[3.6cqw]">
              <Simge.Filtre />
            </span>
            Filtrele
          </span>
        </div>
      </div>

      {/* Etkinlik kartlari */}
      <div className="mt-[3.6cqw] space-y-[3.1cqw] px-[4.6cqw]">
        <EtkinlikKarti
          gorsel="/medya/kart-basket.webp"
          spor="Basketbol"
          aksan={AKSAN.basketbol}
          baslik="Sabah basketi — 3x3 turnuva"
          yer="Kadıköy"
          ne_zaman="Yarın · 09:00 · 1 sa 30 dk"
          etiket="YARIN"
          dolu={6}
          toplam={12}
          gecikme={0.24}
        />
        <EtkinlikKarti
          gorsel="/medya/kart-kosu.webp"
          spor="Koşu"
          aksan={AKSAN.kosu}
          baslik="Kalamış — Bostancı sahil turu"
          yer="Kadıköy"
          ne_zaman="Cmt · 07:30 · 1 sa"
          etiket="3 GÜN SONRA"
          dolu={9}
          toplam={20}
          gecikme={0.36}
        />
      </div>

      <SekmeCubugu
        aktif={0}
        className="girer yukselir"
        style={zamanStili({ gecikme: 0.04, sure: 0.3 })}
      />
    </div>
  );
}

function EtkinlikKarti({
  gorsel,
  spor,
  aksan,
  baslik,
  yer,
  ne_zaman,
  etiket,
  dolu,
  toplam,
  gecikme,
}: {
  gorsel: string;
  spor: string;
  aksan: string;
  baslik: string;
  yer: string;
  ne_zaman: string;
  etiket: string;
  dolu: number;
  toplam: number;
  gecikme: number;
}) {
  return (
    <article
      className="girer yukselir relative h-[45cqw] overflow-hidden rounded-[4.6cqw]"
      style={zamanStili({ gecikme, sure: 0.34 })}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={gorsel} alt="" className="absolute inset-0 size-full object-cover" />
      <span className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-black/25" />

      <div className="relative flex h-full flex-col justify-between p-[3.6cqw]">
        <div className="flex items-start justify-between">
          <span className="flex gap-[1.8cqw]">
            <Rozet renk={aksan}>{spor}</Rozet>
            <Rozet renk={AKSAN.turkuaz}>Ücretsiz</Rozet>
          </span>
          <SoluRozet>{etiket}</SoluRozet>
        </div>

        <div>
          <h3 className="max-w-[72%] text-[4.6cqw] font-bold leading-[1.15] tracking-[-0.01em]">
            {baslik}
          </h3>
          <div className="mt-[1.5cqw] flex flex-col gap-[0.5cqw]">
            <Meta simge={<Simge.Konum />} renk="text-white/80">
              {yer}
            </Meta>
            <Meta simge={<Simge.Takvim />} renk="text-white/80">
              {ne_zaman}
            </Meta>
          </div>

          <div className="mt-[2.3cqw] flex items-end justify-between">
            <AvatarYigini
              kisiler={["selin", "kerem", "deniz"]}
              kalan={dolu - 3}
              boyut={7}
            />
            <span className="text-right">
              <span className="block text-[4.4cqw] font-bold leading-none">
                {dolu} / {toplam}
              </span>
              <span className="mt-[0.8cqw] block text-[2.9cqw] text-white/65">
                {toplam - dolu} yer kaldı
              </span>
            </span>
          </div>

          <span className="mt-[2.1cqw] block">
            <KontenjanCubugu oran={dolu / toplam} renk={aksan} gecikme={gecikme + 0.2} />
          </span>
        </div>
      </div>
    </article>
  );
}

/* ========================================================================== */
/* 2 — Harita                                                                  */
/* ========================================================================== */

/** Pin konumlari ekran yuzdesi olarak; sayi = kumedeki etkinlik adedi. */
const pinler = [
  { x: 62, y: 20, n: 2, gecikme: 0.3 },
  { x: 41, y: 46, n: 3, gecikme: 0.4 },
  { x: 74, y: 58, n: 1, gecikme: 0.5 },
  { x: 30, y: 68, n: 4, gecikme: 0.6 },
];

export function EkranHarita() {
  return (
    <div className="relative size-full overflow-hidden bg-[#0a1524] text-white">
      {/* Harita, sahne ilerledikce yavasca yaklasir */}
      <div
        className="absolute inset-0"
        style={{
          transform:
            "scale(calc(1.14 - var(--p, 0) * 0.12)) translateY(calc(var(--p, 0) * -2cqw))",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/medya/harita.webp"
          alt=""
          className="size-full object-cover object-center"
        />
      </div>

      <DurumCubugu saat="08:35" />

      {/* Yuzen baslik karti */}
      <div
        className="girer yukselir absolute inset-x-[3.6cqw] top-[10.5cqw] rounded-[5.1cqw] border border-white/10 bg-[#0b1723]/85 pb-[3.1cqw] pt-[3.1cqw] backdrop-blur-md"
        style={zamanStili({ gecikme: 0, sure: 0.3 })}
      >
        <UygulamaBasligi />
        <div className="mx-[4.6cqw] mt-[3.1cqw] border-t border-white/8 pt-[3.1cqw]">
          <div className="flex items-center justify-between">
            <span className="flex h-[10.5cqw] items-center rounded-full border border-white/10 bg-white/[0.04] p-[0.9cqw]">
              <span className="flex h-[8.7cqw] items-center gap-[1.5cqw] rounded-full px-[3.3cqw] text-[3.3cqw] font-medium text-white/45">
                <span className="block size-[3.6cqw]">
                  <Simge.Liste />
                </span>
                Liste
              </span>
              <span className="flex h-[8.7cqw] items-center gap-[1.5cqw] rounded-full bg-lime px-[3.3cqw] text-[3.3cqw] font-semibold text-bg">
                <span className="block size-[3.6cqw]">
                  <Simge.Harita />
                </span>
                Harita
              </span>
            </span>
            <span className="flex h-[10.5cqw] items-center gap-[1.8cqw] rounded-full border border-white/10 bg-white/[0.04] px-[4.1cqw] text-[3.3cqw] font-semibold">
              <span className="block size-[3.6cqw]">
                <Simge.Filtre />
              </span>
              Filtrele
            </span>
          </div>
        </div>
      </div>

      {/* Kume pinleri: sirayla yukaridan duser, altlarinda halka yayilir */}
      {pinler.map((pin) => (
        <span
          key={`${pin.x}-${pin.y}`}
          className="absolute"
          style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
        >
          <span
            className="girer duser relative flex size-[11cqw] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-[0.65cqw] border-lime bg-[#0b1723]/85 text-[3.85cqw] font-bold text-lime backdrop-blur-sm"
            style={zamanStili({ gecikme: pin.gecikme, sure: 0.3 })}
          >
            {pin.n}
            <span
              className="girer absolute inset-0 rounded-full border border-lime"
              style={{
                opacity: "calc((1 - var(--t)) * 0.9)",
                transform: "scale(calc(1 + var(--t) * 1.9))",
                ...zamanStili({ gecikme: pin.gecikme + 0.05, sure: 0.45 }),
              }}
            />
          </span>
        </span>
      ))}

      {/* Kullanicinin konumu */}
      <span
        className="girer patlar absolute left-[46%] top-[40%] size-[4.1cqw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime ring-[1cqw] ring-lime/25"
        style={zamanStili({ gecikme: 0.22, sure: 0.25 })}
      />

      {/* Konuma don dugmesi */}
      <span
        className="girer patlar absolute bottom-[22cqw] right-[5.1cqw] flex size-[11cqw] items-center justify-center rounded-full border border-white/12 bg-[#0b1723]/85 backdrop-blur-md"
        style={zamanStili({ gecikme: 0.66, sure: 0.25 })}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          className="size-[5.4cqw] text-lime"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v3m0 14v3M2 12h3m14 0h3" strokeLinecap="round" />
        </svg>
      </span>

      <span className="absolute bottom-[21cqw] left-[5.1cqw] text-[2.6cqw] font-semibold text-white/35">
        mapbox
      </span>

      <SekmeCubugu
        aktif={0}
        className="girer yukselir"
        style={zamanStili({ gecikme: 0.04, sure: 0.3 })}
      />
    </div>
  );
}

/* ========================================================================== */
/* 3 & 4 — Etkinlik detayi (Genel / Katilimcilar)                              */
/* ========================================================================== */

const kadro: [ad: string, kullanici: string, kisi: string][] = [
  ["Selin Aydın", "@selin.aydin", "selin"],
  ["Kerem Doğan", "@kerem.dogan", "kerem"],
  ["Deniz Arslan", "@deniz.arslan", "deniz"],
  ["Barış Koç", "@baris.koc", "baris"],
  ["İrem Tekin", "@irem.tekin", "yeni-2"],
];

export function EkranDetay({ sekme = "genel" }: { sekme?: "genel" | "kadro" }) {
  const kadroAcik = sekme === "kadro";

  return (
    <div className="relative size-full overflow-hidden bg-bg text-white">
      {/* Tam ekran fotograf, sahne boyunca yavasca yaklasir */}
      <div
        className="absolute inset-0"
        style={{ transform: "scale(calc(1.08 + var(--p, 0) * 0.06))" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/medya/detay-basket.webp"
          alt=""
          className="size-full object-cover"
        />
      </div>
      <span className="absolute inset-0 bg-gradient-to-b from-black/55 via-[#06111a]/78 to-[#06111a]/95" />

      <div className="relative flex h-full flex-col">
        <DurumCubugu saat={kadroAcik ? "09:15" : "09:07"} />

        {/* Geri / duzenle */}
        <div
          className="girer belirir mt-[2.6cqw] flex items-center justify-between px-[4.6cqw]"
          style={zamanStili({ gecikme: 0, sure: 0.25 })}
        >
          <span className="flex size-[10cqw] items-center justify-center rounded-full bg-black/45 backdrop-blur-sm">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.9}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[5.1cqw]"
            >
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </span>
        </div>

        <div className="mt-[2.6cqw] px-[4.6cqw]">
          <span
            className="girer patlar inline-flex gap-[1.8cqw]"
            style={zamanStili({ gecikme: 0.06, sure: 0.26 })}
          >
            <Rozet renk={AKSAN.basketbol}>Basketbol</Rozet>
            <SoluRozet>{kadroAcik ? "6 GÜN SONRA" : "YARIN"}</SoluRozet>
          </span>

          <h3
            className="girer yukselir mt-[2.6cqw] text-[6.9cqw] font-bold leading-[1.08] tracking-[-0.02em]"
            style={zamanStili({ gecikme: 0.12, sure: 0.34 })}
          >
            {kadroAcik ? "Cumartesi açık hava basket" : "Sabah basketi — 3x3 turnuva"}
          </h3>

          <div
            className="girer yukselir mt-[2.3cqw] flex flex-wrap items-center gap-x-[3.1cqw] gap-y-[1cqw]"
            style={zamanStili({ gecikme: 0.18, sure: 0.3 })}
          >
            <Meta simge={<Simge.Konum />}>Kadıköy</Meta>
            <Meta simge={<Simge.Saat />}>{kadroAcik ? "15:00" : "09:00"}</Meta>
            <Meta simge={<Simge.Takvim />}>{kadroAcik ? "3 sa" : "1 sa 30 dk"}</Meta>
            <Meta simge={<Simge.Kisi />}>16–65 yaş</Meta>
            <Meta simge={<Simge.Para />}>Ücretsiz</Meta>
          </div>

          {/* Kadro ozeti */}
          <div
            className="girer yukselir mt-[3.6cqw] flex items-end justify-between"
            style={zamanStili({ gecikme: 0.24, sure: 0.3 })}
          >
            <AvatarYigini kisiler={["selin", "kerem", "deniz"]} kalan={3} boyut={8.5} />
            <span className="text-right">
              <span className="block text-[4.6cqw] font-bold leading-none">
                6 / {kadroAcik ? 20 : 12} kişi
              </span>
              <span className="mt-[0.8cqw] block text-[3.1cqw] text-white/60">
                {kadroAcik ? 14 : 6} yer kaldı
              </span>
            </span>
          </div>
          <span className="mt-[2.3cqw] block">
            <KontenjanCubugu
              oran={kadroAcik ? 0.3 : 0.5}
              renk={AKSAN.basketbol}
              gecikme={0.34}
            />
          </span>

          {/* Sekmeler — lime hap secili sekmeye kayar */}
          <div
            className="girer yukselir relative mt-[4.1cqw] flex h-[12cqw] items-center rounded-[3.6cqw] border border-white/10 bg-white/[0.05] p-[1cqw]"
            style={zamanStili({ gecikme: 0.3, sure: 0.3 })}
          >
            <span
              className="absolute left-[1cqw] top-[1cqw] h-[10cqw] w-[32.2%] rounded-[2.8cqw] bg-lime transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: kadroAcik ? "translateX(100%)" : "translateX(0)" }}
            />
            {["Genel", "Katılımcılar", "Sorular"].map((s, i) => (
              <span
                key={s}
                className={`relative z-10 flex w-1/3 justify-center text-[3.6cqw] font-semibold tracking-[0.02em] ${
                  (kadroAcik ? i === 1 : i === 0) ? "text-bg" : "text-white/40"
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Sekme icerigi. `min-h-0` sart: flex cocugu varsayilan olarak kendi
            iceriginden kisa olamaz, o yuzden icerik uzayinca alttaki "Katıl"
            cubugunu ekranin disina itiyordu. Simdi gercek bir telefonda
            oldugu gibi altta kirpiliyor. */}
        <div className="mt-[3.1cqw] min-h-0 flex-1 overflow-hidden px-[4.6cqw]">
          {kadroAcik ? (
            <div
              className="girer yukselir overflow-hidden rounded-[4.1cqw] border border-white/8 bg-white/[0.04]"
              style={zamanStili({ gecikme: 0.36, sure: 0.3 })}
            >
              <div className="flex items-center justify-between px-[3.6cqw] py-[2.8cqw] text-[3.3cqw]">
                <span className="font-semibold">Kadro</span>
                <span className="text-white/45">6 kişi</span>
              </div>
              {kadro.map(([ad, kullanici, kisi], i) => (
                <div
                  key={ad}
                  className="girer sagdan flex items-center gap-[3.1cqw] border-t border-white/6 px-[3.6cqw] py-[2.3cqw]"
                  style={zamanStili({ gecikme: 0.42 + i * 0.055, sure: 0.28 })}
                >
                  <Avatar kisi={kisi} ad={ad} boyut={9.5} />
                  <span className="flex-1">
                    <span className="block text-[3.85cqw] font-semibold">{ad}</span>
                    <span className="block text-[3.1cqw] text-white/45">{kullanici}</span>
                  </span>
                  <span className="text-[3.6cqw] text-white/30">›</span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div
                className="girer yukselir rounded-[4.1cqw] border border-white/8 bg-white/[0.04] p-[3.6cqw]"
                style={zamanStili({ gecikme: 0.36, sure: 0.3 })}
              >
                <span className="block text-[3.1cqw] text-white/45">Etkinlik Sahibi</span>
                <span className="mt-[2.3cqw] flex items-center gap-[3.1cqw]">
                  <Avatar kisi="selin" ad="Selin Aydın" boyut={10} />
                  <span className="text-[4.1cqw] font-semibold">@selin.aydin</span>
                </span>
              </div>

              <div
                className="girer yukselir mt-[3.1cqw] rounded-[4.1cqw] border border-white/8 bg-white/[0.04] p-[3.6cqw]"
                style={zamanStili({ gecikme: 0.44, sure: 0.3 })}
              >
                <span className="block text-[3.1cqw] text-white/45">Etkinlik Hakkında</span>
                <p className="mt-[1.8cqw] text-[3.6cqw] leading-[1.5] text-white/85">
                  Hafta içi sabahları toplanıp 3x3 oynuyoruz. Seviye farkı
                  gözetmiyoruz, yeni başlayanlar da gelsin. Takımları yerinde
                  kuruyoruz, yedek forma var.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Alt eylem cubugu */}
        <div
          className="girer yukselir relative z-10 flex items-center gap-[2.8cqw] border-t border-white/8 bg-[#081420]/92 px-[4.6cqw] pb-[6.4cqw] pt-[3.1cqw] backdrop-blur-md"
          style={zamanStili({ gecikme: 0.52, sure: 0.32 })}
        >
          <span className="flex h-[12.8cqw] flex-1 items-center justify-center rounded-full bg-lime text-[4.1cqw] font-bold text-bg">
            Katıl
          </span>
          <span className="flex size-[12.8cqw] items-center justify-center rounded-full border border-lime/35">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-[5.4cqw] text-lime"
            >
              <path d="M12 16V4m-4 4 4-4 4 4M5 15v4h14v-4" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* 5 — Kesfet akisi                                                            */
/* ========================================================================== */

const yeniSporcular = ["yeni-1", "yeni-2", "yeni-3", "yeni-4", "yeni-5", "yeni-6", "yeni-7"];

export function EkranAkis() {
  return (
    <div className="relative size-full overflow-hidden bg-bg text-white">
      <DurumCubugu saat="10:31" />

      <UygulamaBasligi
        artiVar
        className="girer yukselir mt-[3.1cqw]"
        style={zamanStili({ gecikme: 0, sure: 0.3 })}
      />

      {/* Akis sekmeleri */}
      <div
        className="girer yukselir mt-[4.6cqw] flex gap-[5.1cqw] px-[4.6cqw]"
        style={zamanStili({ gecikme: 0.07, sure: 0.3 })}
      >
        <span className="relative pb-[2.1cqw] text-[4.1cqw] font-semibold">
          Tüm gönderiler
          <span
            className="girer dolar absolute inset-x-0 bottom-0 block h-[0.65cqw] rounded-full bg-lime"
            style={zamanStili({ gecikme: 0.16, sure: 0.3 })}
          />
        </span>
        <span className="pb-[2.1cqw] text-[4.1cqw] text-white/40">Arkadaşlarım</span>
      </div>

      {/* Yeni sporcular */}
      <div className="border-y border-white/8 py-[3.1cqw]">
        <div
          className="girer belirir flex items-center justify-between px-[4.6cqw]"
          style={zamanStili({ gecikme: 0.2, sure: 0.25 })}
        >
          <span className="text-[3.1cqw] tracking-[0.12em] text-white/45">
            Yeni sporcular
          </span>
          <span className="text-[3.1cqw] font-semibold tracking-[0.06em] text-lime">
            Tümünü gör
          </span>
        </div>

        <div className="mt-[2.6cqw] flex gap-[2.6cqw] px-[4.6cqw]">
          {yeniSporcular.map((kisi, i) => (
            <Avatar
              key={kisi}
              kisi={kisi}
              boyut={11.5}
              halka
              className="girer sagdan"
              style={zamanStili({ gecikme: 0.26 + i * 0.045, sure: 0.3 })}
            />
          ))}
        </div>
      </div>

      {/* Gonderi */}
      <article
        className="girer yukselir mt-[3.1cqw]"
        style={zamanStili({ gecikme: 0.4, sure: 0.34 })}
      >
        <div className="flex items-center gap-[2.8cqw] px-[4.6cqw]">
          <Avatar kisi="ece" ad="Ece Yıldırım" boyut={10.5} />
          <span className="flex-1">
            <span className="block text-[3.85cqw] font-semibold">@ece.yildirim</span>
            <span className="block text-[3.1cqw] tracking-[0.1em] text-white/40">
              1 sa
            </span>
          </span>
          <span className="text-[3.3cqw] font-semibold text-lime">Arkadaş ekle</span>
        </div>

        <div className="relative mt-[3.1cqw] h-[62cqw] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/medya/gonderi.webp"
            alt=""
            className="size-full object-cover"
            style={{ transform: "scale(calc(1.1 - var(--p, 0) * 0.08))" }}
          />
        </div>

        <div className="mt-[3.1cqw] flex items-center gap-[2.6cqw] px-[4.6cqw]">
          <span
            className="girer patlar flex h-[9cqw] items-center gap-[1.8cqw] rounded-full border border-lime/35 bg-lime/10 px-[3.6cqw] text-[3.3cqw] font-semibold text-lime"
            style={zamanStili({ gecikme: 0.6, sure: 0.26 })}
          >
            <span className="block size-[4.1cqw]">
              <Simge.Kalp />
            </span>
            24
          </span>
          <span
            className="girer patlar flex h-[9cqw] items-center gap-[1.8cqw] rounded-full border border-white/12 px-[3.6cqw] text-[3.3cqw] font-semibold text-white/70"
            style={zamanStili({ gecikme: 0.66, sure: 0.26 })}
          >
            <span className="block size-[4.1cqw]">
              <Simge.Yorum />
            </span>
            6
          </span>
        </div>
      </article>

      <SekmeCubugu
        aktif={1}
        className="girer yukselir"
        style={zamanStili({ gecikme: 0.04, sure: 0.3 })}
      />
    </div>
  );
}
