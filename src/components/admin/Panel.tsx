"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ApiHatasi,
  gorece,
  GERI_BILDIRIM_DURUMU,
  ISLEM_ADLARI,
  KULLANICI_DURUMU,
  OTURUM_DUSTU,
  girisIstegi,
  istek,
  oturumuOku,
  oturumuYaz,
  tarih,
  type GeriBildirim,
  type GeriBildirimSayfasi,
  type IslemKaydi,
  type KullaniciDetay,
  type KullaniciOzet,
  type Oturum,
  type Sayfa,
} from "@/lib/admin/api";

import { useOnay } from "./Onay";
import { Avatar, Bilgi, Hata, mesaj, Sayfalama } from "./ortak";
import { Duyuru } from "./Duyuru";
import { Etkinlikler } from "./Etkinlikler";
import { Kulupler } from "./Kulupler";
import { Oturumlar, SikayetGecmisi } from "./KullaniciEkleri";
import { Ozet } from "./Ozet";
import { IcerikBolumu, Sikayetler } from "./Sikayetler";

type Sekme = "ozet" | "kullanicilar" | "sikayetler" | "etkinlikler" | "kulupler" | "geri-bildirim" | "duyuru" | "kayit";

const SEKMELER: { id: Sekme; ad: string }[] = [
  { id: "ozet", ad: "Özet" },
  { id: "kullanicilar", ad: "Kullanıcılar" },
  { id: "sikayetler", ad: "Şikâyetler" },
  { id: "etkinlikler", ad: "Etkinlikler" },
  { id: "kulupler", ad: "Kulüpler" },
  { id: "geri-bildirim", ad: "Geri bildirimler" },
  { id: "duyuru", ad: "Duyuru" },
  { id: "kayit", ad: "İşlem kaydı" },
];

export default function Panel() {
  const [hazir, setHazir] = useState(false);
  const [girisli, setGirisli] = useState(false);
  const [sekme, setSekme] = useState<Sekme>("ozet");
  // Şikâyetler/Etkinlikler/Kulüpler sekmelerinden açılan kullanıcı detayı; sekme değişince kapanır.
  const [sikayetKullanicisi, setSikayetKullanicisi] = useState<string | null>(null);
  // Kulüp detayındaki bir etkinliği Etkinlikler sekmesinde açmak için.
  const [acilacakEtkinlik, setAcilacakEtkinlik] = useState<string | null>(null);

  const sekmeyeGec = (yeni: Sekme) => {
    setSekme(yeni);
    setSikayetKullanicisi(null);
  };

  useEffect(() => {
    const dustu = () => setGirisli(false);
    window.addEventListener(OTURUM_DUSTU, dustu);

    // Kayıtlı oturum hâlâ yönetici mi; değilse istek() oturumu temizler.
    if (oturumuOku()) {
      istek<void>("/api/admin/me")
        .then(() => setGirisli(true))
        .catch(() => setGirisli(false))
        .finally(() => setHazir(true));
    } else {
      setHazir(true);
    }

    return () => window.removeEventListener(OTURUM_DUSTU, dustu);
  }, []);

  const cikis = async () => {
    const oturum = oturumuOku();
    if (oturum) {
      // Sunucudaki oturumu da kapat; hata olsa bile yerelde çıkış yapılır.
      await istek<void>("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: oturum.refreshToken }),
      }).catch(() => undefined);
    }
    oturumuYaz(null);
    setGirisli(false);
  };

  if (!hazir) {
    return <div className="grid min-h-svh place-items-center text-muted">Yükleniyor…</div>;
  }

  if (!girisli) {
    return <Giris onGiris={() => setGirisli(true)} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <header className="sticky top-0 z-40 -mx-4 border-b border-line bg-bg/80 px-4 backdrop-blur-xl backdrop-saturate-150 sm:-mx-6 sm:px-6">
        <div className="flex h-16 items-center justify-between gap-4">
          <Marka />
          <button
            type="button"
            onClick={() => void cikis()}
            className="rounded-full border border-line px-4 py-1.5 text-sm text-muted transition-colors hover:border-line-strong hover:text-ink"
          >
            Çıkış
          </button>
        </div>
        <nav className="-mb-px flex gap-6 overflow-x-auto">
          {SEKMELER.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                setAcilacakEtkinlik(null);
                sekmeyeGec(s.id);
              }}
              className={`shrink-0 border-b-2 pb-3 pt-1 text-sm font-semibold transition-colors ${
                sekme === s.id ? "border-lime text-ink" : "border-transparent text-soft hover:text-muted"
              }`}
            >
              {s.ad}
            </button>
          ))}
        </nav>
      </header>

      <div className="pt-8">
        {sekme === "kullanicilar" ? <Kullanicilar /> : null}
        {sekme === "ozet" ? <Ozet onSekme={sekmeyeGec} /> : null}
        {sekme === "sikayetler" ? (
          <>
            {sikayetKullanicisi ? (
              <KullaniciDetayi id={sikayetKullanicisi} onGeri={() => setSikayetKullanicisi(null)} geriAd="Şikâyetler" />
            ) : null}
            {/* Liste açık kalır (gizlenir) ki geri dönünce filtre ve sayfa korunsun. */}
            <div className={sikayetKullanicisi ? "hidden" : ""}>
              <Sikayetler onKullanici={setSikayetKullanicisi} />
            </div>
          </>
        ) : null}
        {sekme === "etkinlikler" ? (
          <>
            {sikayetKullanicisi ? (
              <KullaniciDetayi
                id={sikayetKullanicisi}
                onGeri={() => setSikayetKullanicisi(null)}
                geriAd="Etkinlikler"
              />
            ) : null}
            <div className={sikayetKullanicisi ? "hidden" : ""}>
              <Etkinlikler
                onKullanici={setSikayetKullanicisi}
                acilisId={acilacakEtkinlik}
                onAcildi={() => setAcilacakEtkinlik(null)}
              />
            </div>
          </>
        ) : null}
        {sekme === "kulupler" ? (
          <>
            {sikayetKullanicisi ? (
              <KullaniciDetayi id={sikayetKullanicisi} onGeri={() => setSikayetKullanicisi(null)} geriAd="Kulüpler" />
            ) : null}
            <div className={sikayetKullanicisi ? "hidden" : ""}>
              <Kulupler
                onKullanici={setSikayetKullanicisi}
                onEtkinlik={(id) => {
                  setAcilacakEtkinlik(id);
                  sekmeyeGec("etkinlikler");
                }}
              />
            </div>
          </>
        ) : null}
        {sekme === "geri-bildirim" ? <GeriBildirimler /> : null}
        {sekme === "duyuru" ? <Duyuru /> : null}
        {sekme === "kayit" ? <IslemKaydiListesi /> : null}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Marka

function Marka() {
  return (
    <div className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.png" alt="" width={28} height={28} className="size-7" />
      <span className="font-display text-[0.95rem] font-bold uppercase tracking-[0.28em]">Sportner</span>
      <span className="ml-1 rounded-md bg-lime/10 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-lime ring-1 ring-lime/25">
        Yönetim
      </span>
    </div>
  );
}

// ---------------------------------------------------------------- Giriş

function Giris({ onGiris }: { onGiris: () => void }) {
  const [eposta, setEposta] = useState("");
  const [kod, setKod] = useState("");
  const [adim, setAdim] = useState<"eposta" | "kod">("eposta");
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);

  const kodIste = async (event: React.FormEvent) => {
    event.preventDefault();
    setBekliyor(true);
    setHata(null);
    try {
      await girisIstegi<void>("/api/admin/auth/code", { email: eposta });
      setAdim("kod");
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  const dogrula = async (event: React.FormEvent) => {
    event.preventDefault();
    setBekliyor(true);
    setHata(null);
    try {
      const oturum = await girisIstegi<Oturum>("/api/admin/auth/verify", {
        email: eposta,
        code: kod,
      });
      oturumuYaz(oturum);
      onGiris();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  return (
    <div className="grid min-h-svh place-items-center px-4">
      <form
        onSubmit={adim === "eposta" ? kodIste : dogrula}
        className="w-full max-w-sm rounded-3xl border border-line bg-surface p-7 shadow-[0_30px_80px_-30px_rgba(204,255,0,0.15)]"
      >
        <Marka />
        <h1 className="mt-7 font-display text-2xl font-bold">Panele giriş</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          {adim === "eposta"
            ? "Yönetici hesabının e-postasını yaz, giriş kodu gönderelim."
            : `${eposta} adresine 6 haneli bir kod gönderdik. Kod 10 dakika geçerli.`}
        </p>

        {adim === "eposta" ? (
          <input
            type="email"
            required
            autoComplete="email"
            value={eposta}
            onChange={(event) => setEposta(event.target.value)}
            placeholder="ornek@gmail.com"
            className="mt-6 w-full rounded-xl border border-line bg-bg px-4 py-3 outline-none focus:border-lime"
          />
        ) : (
          <input
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            maxLength={6}
            value={kod}
            onChange={(event) => setKod(event.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            className="mt-6 w-full rounded-xl border border-line bg-bg px-4 py-3 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-lime"
          />
        )}

        {hata ? <p className="mt-3 text-sm text-basketbol">{hata}</p> : null}

        <button
          type="submit"
          disabled={bekliyor}
          className="mt-5 w-full rounded-full bg-lime py-3 font-semibold text-bg disabled:opacity-50"
        >
          {bekliyor ? "Bekle…" : adim === "eposta" ? "Kod gönder" : "Giriş yap"}
        </button>

        {adim === "kod" ? (
          <button
            type="button"
            onClick={() => {
              setAdim("eposta");
              setKod("");
              setHata(null);
            }}
            className="mt-3 w-full text-sm text-soft hover:text-ink"
          >
            E-postayı değiştir
          </button>
        ) : null}
      </form>
    </div>
  );
}

// ---------------------------------------------------------------- Ortak parçalar

function DurumRozeti({ durum }: { durum: number }) {
  const bilgi = KULLANICI_DURUMU[durum];
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${bilgi?.rozet ?? ""}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {bilgi?.ad ?? durum}
    </span>
  );
}

// ---------------------------------------------------------------- Kullanıcılar

function Kullanicilar() {
  const [arama, setArama] = useState("");
  const [uygulanan, setUygulanan] = useState("");
  const [durum, setDurum] = useState<string>("");
  const [sayfaNo, setSayfaNo] = useState(1);
  const [sayfa, setSayfa] = useState<Sayfa<KullaniciOzet> | null>(null);
  const [secili, setSecili] = useState<string | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setHata(null);
    const parametre = new URLSearchParams({
      page: String(sayfaNo),
      pageSize: "25",
    });
    if (uygulanan) parametre.set("search", uygulanan);
    if (durum) parametre.set("status", durum);
    try {
      setSayfa(await istek<Sayfa<KullaniciOzet>>(`/api/admin/users?${parametre}`));
    } catch (error) {
      setHata(mesaj(error));
    }
  }, [sayfaNo, uygulanan, durum]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  if (secili) {
    return (
      <KullaniciDetayi
        id={secili}
        onGeri={() => {
          setSecili(null);
          void yukle();
        }}
      />
    );
  }

  return (
    <section>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setSayfaNo(1);
          setUygulanan(arama.trim());
        }}
      >
        <input
          value={arama}
          onChange={(event) => setArama(event.target.value)}
          placeholder="Kullanıcı adı, isim, e-posta ya da ID ara"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-5 py-2.5 outline-none transition-colors placeholder:text-soft focus:border-lime"
        />
        <select
          value={durum}
          onChange={(event) => {
            setSayfaNo(1);
            setDurum(event.target.value);
          }}
          className="rounded-full border border-line bg-surface px-4 py-2.5 text-sm"
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(KULLANICI_DURUMU).map(([deger, { ad }]) => (
            <option key={deger} value={deger}>
              {ad}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-full bg-lime px-6 py-2.5 font-semibold text-bg transition-transform hover:scale-[1.03]"
        >
          Ara
        </button>
      </form>

      <div className="mt-4">
        <Hata metin={hata} />
      </div>

      <div className="mt-3 overflow-hidden rounded-3xl border border-line bg-surface">
        <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_10rem_7rem_7rem] gap-4 border-b border-line px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-soft md:grid">
          <span>Kullanıcı</span>
          <span>E-posta</span>
          <span>Durum</span>
          <span>Kayıt</span>
          <span>Son görülme</span>
        </div>
        <ul className="divide-y divide-line">
          {sayfa?.items.map((kullanici) => {
            const ad = [kullanici.firstName, kullanici.lastName].filter(Boolean).join(" ");
            return (
              <li key={kullanici.id}>
                <button
                  type="button"
                  onClick={() => setSecili(kullanici.id)}
                  className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-2/60 md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_10rem_7rem_7rem]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar url={kullanici.profileImageUrl} ad={ad || kullanici.username || "?"} />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold transition-colors group-hover:text-lime">
                        {kullanici.username ? `@${kullanici.username}` : "Profil yok"}
                      </span>
                      <span className="block truncate text-sm text-soft">{ad || "İsim yok"}</span>
                    </span>
                  </span>
                  <span className="hidden truncate text-sm text-muted md:block">{kullanici.email ?? "—"}</span>
                  <span>
                    <DurumRozeti durum={kullanici.status} />
                  </span>
                  <span className="hidden text-sm text-muted md:block">{gorece(kullanici.createdAt)}</span>
                  <span className="hidden text-sm text-muted md:block">{gorece(kullanici.lastSeenAt)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        {sayfa && sayfa.items.length === 0 ? <p className="py-14 text-center text-muted">Sonuç yok.</p> : null}
      </div>

      {sayfa ? <Sayfalama sayfa={sayfa} onDegis={setSayfaNo} /> : null}
    </section>
  );
}

function KullaniciDetayi({
  id,
  onGeri,
  geriAd = "Kullanıcılar",
}: {
  id: string;
  onGeri?: () => void;
  geriAd?: string;
}) {
  const [detay, setDetay] = useState<KullaniciDetay | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [banAcik, setBanAcik] = useState(false);
  const [sebep, setSebep] = useState("");
  const [fotoSil, setFotoSil] = useState(true);
  const [bekliyor, setBekliyor] = useState(false);
  // Şikâyet geçmişindeki bir kişiye tıklanınca ikinci bir detay açılır; bu detay gizli kalıp durumunu korur.
  const [digerId, setDigerId] = useState<string | null>(null);
  const [onayIste, onayPenceresi] = useOnay();

  const yukle = useCallback(async () => {
    setHata(null);
    try {
      setDetay(await istek<KullaniciDetay>(`/api/admin/users/${id}`));
    } catch (error) {
      setHata(mesaj(error));
    }
  }, [id]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  const banla = async () => {
    setBekliyor(true);
    setHata(null);
    try {
      await istek<void>(`/api/admin/users/${id}/ban`, {
        method: "POST",
        body: JSON.stringify({
          reason: sebep.trim() || null,
          removeAvatar: fotoSil,
        }),
      });
      setBanAcik(false);
      setSebep("");
      await yukle();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  const baniKaldir = async () => {
    const onay = await onayIste({
      baslik: "Ban kaldırılsın mı?",
      metin: `@${detay?.user.username ?? "kullanıcı"} tekrar giriş yapıp uygulamayı kullanabilecek.`,
      onayAd: "Banı kaldır",
    });
    if (!onay) {
      return;
    }
    setBekliyor(true);
    setHata(null);
    try {
      await istek<void>(`/api/admin/users/${id}/unban`, { method: "POST" });
      await yukle();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  const testHesabiDegistir = async () => {
    if (!detay) {
      return;
    }
    const yeni = !detay.isTestAccount;
    const onay = await onayIste({
      baslik: yeni ? "Test hesabı olarak işaretlensin mi?" : "Test hesabı işareti kaldırılsın mı?",
      metin: yeni
        ? "Test hesabının içerikleri gerçek kullanıcılara görünmez."
        : "Hesabın içerikleri gerçek kullanıcılara tekrar görünür olacak.",
      onayAd: yeni ? "Test hesabı yap" : "İşareti kaldır",
    });
    if (!onay) {
      return;
    }
    setBekliyor(true);
    setHata(null);
    try {
      await istek<void>(`/api/admin/users/${id}/test-account`, {
        method: "POST",
        body: JSON.stringify({ isTestAccount: yeni }),
      });
      await yukle();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  const kullanici = detay?.user;
  const ad = kullanici ? [kullanici.firstName, kullanici.lastName].filter(Boolean).join(" ") : "";

  return (
    <>
      {digerId ? (
        <KullaniciDetayi
          id={digerId}
          onGeri={() => setDigerId(null)}
          geriAd={kullanici?.username ? `@${kullanici.username}` : "Önceki kullanıcı"}
        />
      ) : null}
      <section className={digerId ? "hidden" : ""}>
        {onayPenceresi}
        {onGeri ? (
          <button type="button" onClick={onGeri} className="text-sm text-soft hover:text-ink">
            ← {geriAd}
          </button>
        ) : null}

        <div className={onGeri ? "mt-4" : ""}>
          <Hata metin={hata} />
        </div>

        {kullanici && detay ? (
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_320px]">
            <div className="rounded-3xl border border-line bg-surface p-6">
              <div className="flex items-center gap-4">
                <Avatar url={kullanici.profileImageUrl} ad={ad || kullanici.username || "?"} buyuk />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-bold">
                    {kullanici.username ? `@${kullanici.username}` : "Profil yok"}
                  </h2>
                  <p className="truncate text-muted">{ad || "İsim yok"}</p>
                </div>
                <span className="ml-auto shrink-0">
                  <DurumRozeti durum={kullanici.status} />
                </span>
              </div>

              {detay.bio ? <p className="mt-5 whitespace-pre-line text-sm text-muted">{detay.bio}</p> : null}

              <dl className="mt-6 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <Bilgi ad="E-posta" deger={kullanici.email ?? "—"} />
                <Bilgi
                  ad="Giriş yöntemi"
                  deger={
                    [...detay.loginProviders, detay.hasPassword ? "Şifre" : null].filter(Boolean).join(", ") || "—"
                  }
                />
                <Bilgi ad="Şehir" deger={detay.city ?? "—"} />
                <Bilgi ad="Kayıt" deger={tarih(kullanici.createdAt)} />
                <Bilgi ad="Son görülme" deger={tarih(kullanici.lastSeenAt)} />
                <Bilgi ad="Açık oturum" deger={String(detay.activeSessions)} />
                <Bilgi ad="ID" deger={kullanici.id} mono />
              </dl>

              <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-bg p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Test hesabı</p>
                  <p className="mt-0.5 text-xs text-soft">Açıkken içerikleri gerçek kullanıcılara görünmez.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!!detay.isTestAccount}
                  aria-label="Test hesabı"
                  disabled={bekliyor}
                  onClick={() => void testHesabiDegistir()}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                    detay.isTestAccount ? "bg-lime" : "bg-surface-2 ring-1 ring-line"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 size-5 rounded-full bg-bg ring-1 ring-line transition-transform ${
                      detay.isTestAccount ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <Sayac ad="Gönderi" deger={detay.postsCount} />
                <Sayac ad="Katıldığı etkinlik" deger={detay.eventsJoined} />
                <Sayac ad="Düzenlediği" deger={detay.eventsOrganized} />
                <Sayac ad="Arkadaş" deger={detay.friendsCount} />
                <Sayac ad="Hakkında şikâyet" deger={detay.reportsAgainst} vurgu={detay.reportsAgainst > 0} />
                <Sayac ad="Geri bildirim" deger={detay.feedbackCount} />
                <Sayac ad="Engellediği" deger={detay.blockedCount} />
                <Sayac ad="Onu engelleyen" deger={detay.blockedByCount} />
                <Sayac ad="Yaptığı şikâyet" deger={detay.reportsByCount} />
              </div>

              {detay.isAdmin ? (
                <p className="rounded-2xl border border-line p-4 text-sm text-muted">Bu bir yönetici hesabı.</p>
              ) : kullanici.status === 3 ? (
                <button
                  type="button"
                  disabled={bekliyor}
                  onClick={() => void baniKaldir()}
                  className="rounded-full border border-line py-3 font-semibold hover:border-lime disabled:opacity-50"
                >
                  Banı kaldır
                </button>
              ) : kullanici.status === 1 || kullanici.status === 2 ? (
                banAcik ? (
                  <div className="rounded-2xl border border-basketbol/40 bg-basketbol/5 p-4">
                    <p className="text-sm font-semibold">Kullanıcıyı banla</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted">
                      Açık oturumları hemen kapanır, tekrar giriş yapamaz. İşlem kayda geçer.
                    </p>
                    <textarea
                      value={sebep}
                      onChange={(event) => setSebep(event.target.value)}
                      placeholder="Sebep (isteğe bağlı, sadece kayıtta görünür)"
                      rows={2}
                      maxLength={1000}
                      className="mt-3 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-basketbol"
                    />
                    <label className="mt-2 flex items-center gap-2 text-sm text-muted">
                      <input type="checkbox" checked={fotoSil} onChange={(event) => setFotoSil(event.target.checked)} />
                      Profil fotoğrafını da sil
                    </label>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        disabled={bekliyor}
                        onClick={() => void banla()}
                        className="flex-1 rounded-full bg-basketbol py-2.5 font-semibold text-bg disabled:opacity-50"
                      >
                        {bekliyor ? "Bekle…" : "Banla"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setBanAcik(false)}
                        className="rounded-full px-4 text-sm text-soft hover:text-ink"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setBanAcik(true)}
                    className="rounded-full border border-basketbol/50 py-3 font-semibold text-basketbol hover:bg-basketbol/10"
                  >
                    Banla
                  </button>
                )
              ) : null}
            </div>
          </div>
        ) : null}

        {kullanici ? <IcerikBolumu kullaniciId={id} /> : null}
        {kullanici ? <SikayetGecmisi key={id} kullaniciId={id} onKullanici={setDigerId} onDegisti={() => void yukle()} /> : null}
        {kullanici ? <Oturumlar key={id} kullaniciId={id} onDegisti={() => void yukle()} /> : null}
      </section>
    </>
  );
}

function Sayac({ ad, deger, vurgu = false }: { ad: string; deger: number; vurgu?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <p className={`font-display text-2xl font-bold ${vurgu ? "text-basketbol" : ""}`}>{deger}</p>
      <p className="mt-1 text-xs text-soft">{ad}</p>
    </div>
  );
}

// ---------------------------------------------------------------- Geri bildirimler

const GERI_BILDIRIM_FILTRELERI = [
  { deger: String(GERI_BILDIRIM_DURUMU.yeni), ad: "Yeni", sayi: "new" },
  { deger: String(GERI_BILDIRIM_DURUMU.okundu), ad: "Okundu", sayi: "read" },
  {
    deger: String(GERI_BILDIRIM_DURUMU.cozuldu),
    ad: "Çözüldü",
    sayi: "resolved",
  },
  { deger: "", ad: "Tümü", sayi: null },
] as const;

function GeriBildirimler() {
  const [filtre, setFiltre] = useState<string>(String(GERI_BILDIRIM_DURUMU.yeni));
  const [sayfaNo, setSayfaNo] = useState(1);
  const [veri, setVeri] = useState<GeriBildirimSayfasi | null>(null);
  const [hata, setHata] = useState<string | null>(null);

  const yukle = useCallback(async () => {
    setHata(null);
    const parametre = new URLSearchParams({
      page: String(sayfaNo),
      pageSize: "20",
    });
    if (filtre) parametre.set("status", filtre);
    try {
      setVeri(await istek<GeriBildirimSayfasi>(`/api/admin/feedback?${parametre}`));
    } catch (error) {
      setHata(mesaj(error));
    }
  }, [filtre, sayfaNo]);

  useEffect(() => {
    void yukle();
  }, [yukle]);

  return (
    <section>
      <div className="flex flex-wrap gap-2">
        {GERI_BILDIRIM_FILTRELERI.map((f) => (
          <button
            key={f.ad}
            type="button"
            onClick={() => {
              setSayfaNo(1);
              setFiltre(f.deger);
            }}
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              filtre === f.deger ? "border-lime text-lime" : "border-line text-muted hover:text-ink"
            }`}
          >
            {f.ad}
            {f.sayi && veri ? <span className="ml-1.5 font-mono text-xs">{veri.counts[f.sayi]}</span> : null}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <Hata metin={hata} />
      </div>

      <div className="mt-2 flex flex-col gap-3">
        {veri?.page.items.map((item) => (
          <GeriBildirimKarti key={item.id} item={item} onDegisti={() => void yukle()} />
        ))}
      </div>

      {veri && veri.page.items.length === 0 ? (
        <p className="py-10 text-center text-muted">Burada bir şey yok.</p>
      ) : null}
      {veri ? <Sayfalama sayfa={veri.page} onDegis={setSayfaNo} /> : null}
    </section>
  );
}

function GeriBildirimKarti({ item, onDegisti }: { item: GeriBildirim; onDegisti: () => void }) {
  const [yanitAcik, setYanitAcik] = useState(false);
  const [yanit, setYanit] = useState(
    `Merhaba${item.firstName ? ` ${item.firstName}` : ""},\n\nGeri bildirimin için teşekkürler. `,
  );
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const [onayIste, onayPenceresi] = useOnay();

  const durumYap = async (durum: number) => {
    setBekliyor(true);
    setHata(null);
    try {
      await istek<void>(`/api/admin/feedback/${item.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: durum }),
      });
      onDegisti();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  const gonder = async () => {
    const onay = await onayIste({
      baslik: "Yanıt gönderilsin mi?",
      metin: (
        <>
          Yanıt <span className="font-semibold text-ink">{item.email}</span> adresine e-postayla gidecek ve geri
          bildirim çözüldü olarak işaretlenecek.
        </>
      ),
      onayAd: "Gönder",
    });
    if (!onay) {
      return;
    }
    setBekliyor(true);
    setHata(null);
    try {
      await istek<void>(`/api/admin/feedback/${item.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ message: yanit }),
      });
      setYanitAcik(false);
      onDegisti();
    } catch (error) {
      setHata(mesaj(error));
    } finally {
      setBekliyor(false);
    }
  };

  return (
    <article className="rounded-3xl border border-line bg-surface p-5">
      {onayPenceresi}
      <header className="flex items-center gap-3">
        <Avatar url={item.profileImageUrl} ad={item.firstName ?? item.username ?? "?"} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">
            {item.username ? `@${item.username}` : "Profil yok"}
            {item.firstName ? <span className="font-normal text-muted"> · {item.firstName}</span> : null}
          </p>
          <p className="truncate text-xs text-soft">
            {item.email ?? "E-posta yok"} · {tarih(item.createdAt)}
          </p>
        </div>
        {item.status === GERI_BILDIRIM_DURUMU.yeni ? (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-lime" aria-label="Yeni" />
        ) : null}
      </header>

      <p className="mt-4 whitespace-pre-line leading-relaxed">{item.content}</p>

      {item.adminReply ? (
        <div className="mt-4 rounded-2xl border border-line bg-bg p-4">
          <p className="text-xs text-soft">Gönderilen yanıt · {tarih(item.repliedAt)}</p>
          <p className="mt-2 whitespace-pre-line text-sm text-muted">{item.adminReply}</p>
        </div>
      ) : null}

      {hata ? <p className="mt-3 text-sm text-basketbol">{hata}</p> : null}

      {yanitAcik ? (
        <div className="mt-4">
          <textarea
            value={yanit}
            onChange={(event) => setYanit(event.target.value)}
            rows={6}
            maxLength={4000}
            className="w-full rounded-xl border border-line bg-bg px-4 py-3 text-sm leading-relaxed outline-none focus:border-lime"
          />
          <p className="mt-1 text-xs text-soft">
            Kullanıcının kendi mesajı e-postanın altına alıntı olarak eklenir. Gönderince geri bildirim çözüldü olur.
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={bekliyor || !yanit.trim()}
              onClick={() => void gonder()}
              className="rounded-full bg-lime px-5 py-2.5 font-semibold text-bg disabled:opacity-50"
            >
              {bekliyor ? "Gönderiliyor…" : "E-postayla gönder"}
            </button>
            <button
              type="button"
              onClick={() => setYanitAcik(false)}
              className="rounded-full px-4 text-sm text-soft hover:text-ink"
            >
              Vazgeç
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.email ? (
            <button
              type="button"
              onClick={() => setYanitAcik(true)}
              className="rounded-full bg-lime px-4 py-2 text-sm font-semibold text-bg"
            >
              {item.adminReply ? "Tekrar yanıtla" : "Yanıtla"}
            </button>
          ) : null}
          {item.status !== GERI_BILDIRIM_DURUMU.okundu ? (
            <button
              type="button"
              disabled={bekliyor}
              onClick={() => void durumYap(GERI_BILDIRIM_DURUMU.okundu)}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Okundu
            </button>
          ) : null}
          {item.status !== GERI_BILDIRIM_DURUMU.cozuldu ? (
            <button
              type="button"
              disabled={bekliyor}
              onClick={() => void durumYap(GERI_BILDIRIM_DURUMU.cozuldu)}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Çözüldü
            </button>
          ) : (
            <button
              type="button"
              disabled={bekliyor}
              onClick={() => void durumYap(GERI_BILDIRIM_DURUMU.yeni)}
              className="rounded-full border border-line px-4 py-2 text-sm text-muted hover:text-ink"
            >
              Yeniden aç
            </button>
          )}
        </div>
      )}
    </article>
  );
}

// ---------------------------------------------------------------- İşlem kaydı

const HEDEF_TURU_ADI: Record<string, string> = {
  report: "Şikâyet",
  post: "Gönderi",
  comment: "Yorum",
  event: "Etkinlik",
  club: "Kulüp",
  announcement: "Duyuru",
};

/** Kullanıcı dışındaki hedeflerde etiket (etkinlik başlığı, kulüp adı) olduğu gibi gösterilir. */
function hedefEtiketi(kayit: IslemKaydi): string | null {
  if (!kayit.targetLabel) return null;
  return kayit.targetType === "event" || kayit.targetType === "club" ? kayit.targetLabel : `@${kayit.targetLabel}`;
}

const GERI_BILDIRIM_DURUM_ADI: Record<string, string> = {
  New: "Yeni",
  Read: "Okundu",
  Resolved: "Çözüldü",
};

/** Kayıttaki serbest metnin işleme göre anlamı: ban gerekçesi, yeni durum... */
function detayEtiketi(kayit: IslemKaydi): { ad: string; deger: string } | null {
  if (!kayit.details) return null;
  if (kayit.action === "user.ban") return { ad: "Ban gerekçesi", deger: kayit.details };
  if (kayit.action === "announcement.send") return { ad: "Duyuru", deger: kayit.details };
  if (kayit.action === "feedback.status")
    return {
      ad: "Yeni durum",
      deger: GERI_BILDIRIM_DURUM_ADI[kayit.details] ?? kayit.details,
    };
  return { ad: "Not", deger: kayit.details };
}

function islemRengi(action: string): string {
  if (
    action === "user.ban" ||
    action === "user.remove_avatar" ||
    action === "event.cancel" ||
    action === "club.close" ||
    action === "user.revoke_sessions"
  )
    return "bg-basketbol";
  if (action === "user.unban") return "bg-lime";
  return "bg-tenis";
}

function IslemKaydiListesi() {
  const [sayfaNo, setSayfaNo] = useState(1);
  const [sayfa, setSayfa] = useState<Sayfa<IslemKaydi> | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const [secili, setSecili] = useState<IslemKaydi | null>(null);

  useEffect(() => {
    istek<Sayfa<IslemKaydi>>(`/api/admin/audit?page=${sayfaNo}&pageSize=50`)
      .then(setSayfa)
      .catch((error: unknown) => setHata(mesaj(error)));
  }, [sayfaNo]);

  if (secili) {
    return <IslemDetayi kayit={secili} onGeri={() => setSecili(null)} />;
  }

  return (
    <section>
      <Hata metin={hata} />
      <div className="overflow-hidden rounded-3xl border border-line bg-surface">
        <ul className="divide-y divide-line">
          {sayfa?.items.map((kayit) => {
            const detay = detayEtiketi(kayit);
            return (
              <li key={kayit.id}>
                <button
                  type="button"
                  onClick={() => setSecili(kayit)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-2"
                >
                  <span className={`size-2 shrink-0 rounded-full ${islemRengi(kayit.action)}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">
                      <span className="font-semibold">@{kayit.actorUsername ?? kayit.actorUserId.slice(0, 8)}</span>{" "}
                      <span className="text-muted">{ISLEM_ADLARI[kayit.action] ?? kayit.action}</span>
                      {hedefEtiketi(kayit) ? <span className="font-semibold"> · {hedefEtiketi(kayit)}</span> : null}
                    </span>
                    {detay ? (
                      <span className="mt-0.5 block truncate text-xs text-soft">
                        {detay.ad}: {detay.deger}
                      </span>
                    ) : null}
                  </span>
                  <span className="shrink-0 text-xs text-soft" title={tarih(kayit.createdAt)}>
                    {gorece(kayit.createdAt)}
                  </span>
                  <span className="shrink-0 text-soft transition-colors group-hover:text-lime">→</span>
                </button>
              </li>
            );
          })}
        </ul>
        {sayfa && sayfa.items.length === 0 ? <p className="py-10 text-center text-muted">Henüz işlem yok.</p> : null}
      </div>
      {sayfa ? <Sayfalama sayfa={sayfa} onDegis={setSayfaNo} /> : null}
    </section>
  );
}

function IslemDetayi({ kayit, onGeri }: { kayit: IslemKaydi; onGeri: () => void }) {
  const [geriBildirim, setGeriBildirim] = useState<GeriBildirim | null>(null);
  const [hata, setHata] = useState<string | null>(null);
  const detay = detayEtiketi(kayit);
  const geriBildirimMi = kayit.targetType === "feedback";
  // Şikâyet/gönderi/yorum/etkinlik hedefleri kullanıcı kimliği değildir; kullanıcı detayı açılmaz.
  const baskaHedefMi = ["report", "post", "comment", "event", "club", "announcement"].includes(kayit.targetType);

  const geriBildirimiYukle = useCallback(async () => {
    try {
      setGeriBildirim(await istek<GeriBildirim>(`/api/admin/feedback/${kayit.targetId}`));
    } catch (error) {
      setHata(mesaj(error));
    }
  }, [kayit.targetId]);

  useEffect(() => {
    if (geriBildirimMi) void geriBildirimiYukle();
  }, [geriBildirimMi, geriBildirimiYukle]);

  return (
    <section>
      <button type="button" onClick={onGeri} className="text-sm text-soft hover:text-ink">
        ← İşlem kaydı
      </button>

      <div className="mt-4 overflow-hidden rounded-3xl border border-line bg-surface">
        <div className={`h-1 w-full ${islemRengi(kayit.action)}`} />
        <div className="p-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-soft">İşlem</p>
          <h2 className="mt-1 font-display text-xl font-bold">{ISLEM_ADLARI[kayit.action] ?? kayit.action}</h2>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <Bilgi ad="Yapan" deger={`@${kayit.actorUsername ?? kayit.actorUserId}`} />
            <Bilgi
              ad="Hedef"
              deger={
                hedefEtiketi(kayit)
                  ? (hedefEtiketi(kayit) as string)
                  : geriBildirimMi
                    ? "Geri bildirim"
                    : baskaHedefMi
                      ? (HEDEF_TURU_ADI[kayit.targetType] ?? kayit.targetType)
                      : kayit.targetId
              }
            />
            <Bilgi ad="Zaman" deger={`${tarih(kayit.createdAt)} (${gorece(kayit.createdAt)})`} />
          </dl>
          {detay ? (
            <div className="mt-5 rounded-2xl border border-line bg-surface-2 p-4">
              <p className="text-xs font-semibold text-soft">{detay.ad}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{detay.deger}</p>
            </div>
          ) : null}
        </div>
      </div>

      {baskaHedefMi ? null : (
        <h3 className="mb-3 mt-8 font-mono text-xs uppercase tracking-[0.18em] text-soft">
          {geriBildirimMi ? "İlgili geri bildirim" : "İlgili kullanıcı"}
        </h3>
      )}
      {baskaHedefMi ? null : geriBildirimMi ? (
        <>
          <Hata metin={hata} />
          {geriBildirim ? <GeriBildirimKarti item={geriBildirim} onDegisti={() => void geriBildirimiYukle()} /> : null}
        </>
      ) : (
        <KullaniciDetayi id={kayit.targetId} />
      )}
    </section>
  );
}
