"use client";

import { useEffect, useRef } from "react";

/**
 * "Insa" efekti: bir bolumun icindeki `data-insa` isaretli bloklari renkli
 * imlecler cerceve cizip yerine koyar. Sayfa her zaman gercek HTML'dir (arama
 * motoru ve App Store incelemesi dogrudan icerigi gorur); bu bilesen yalnizca
 * kisa sureligine bloklari gizleyip yeniden gosterir.
 *
 * Iki kip var:
 *  - "acilis"   : sayfa acilinca hemen calisir, imlecler sahnede gezinir, Atla
 *                 dugmesi vardir (Hero).
 *  - "kaydirma" : her blok gorus alanina girince tek tek insa edilir; kaydirdikca
 *                 yapim ilerler (diger butun bolumler).
 *
 * `data-insa="kutu"` blogun kendi kutusuna, bos birakilirsa icerigine (metne)
 * sikica oturan cerceve cizer.
 *
 * Kapi mantigi (hareket azalt, kaydirilmis sayfa, # baglantisi)
 * sayfa cizilmeden once <InsaKapi /> icindeki satir ici betikte karar verilir;
 * boylece icerik bir an gorunup sonra kaybolmaz. Betik `html` ogesine
 * `data-insa-aktif` (ve Hero icin `data-insa-durum="calisiyor"`) yazar.
 *
 * Imlec fikri Joel Califa'nin "Swarm" calismasindan esinlenmistir; kod
 * sifirdan yazildi, baska bir projeden alinmadi.
 */

declare global {
  interface Window {
    /**
     * Hero efekti bu sayfa yuklemesinde bitti mi? Pencere degiskeni oldugu icin
     * tam sayfa yenilemede sifirlanir (efekt her acilista oynar), ama sayfalar
     * arasi istemci gecisinde (destek -> ana sayfa) kalir (efekt tekrar oynamaz).
     */
    __insaBitti?: boolean;
  }
}

/** Ilk dortu bloklari insa eder, kalanlari sahnede gezinir. Etiketler Sportner'daki roller. */
const AJANLAR = [
  { ad: "Organizatör", renk: "#ff6b1a" },
  { ad: "Kaptan", renk: "#ccff00" },
  { ad: "Oyuncu", renk: "#9a72ff" },
  { ad: "Hakem", renk: "#5eead4" },
  { ad: "Antrenör", renk: "#fbbf24" },
  { ad: "Kaleci", renk: "#38bdf8" },
  { ad: "Yedek", renk: "#f472b6" },
  { ad: "Seyirci", renk: "#a3e635" },
];
const INSA_AJANI = 4;

/** Tum sureleri tek yerden yavaslatir/hizlandirir (1 = ilk deneme). */
const HIZ = 0.5;

const YUMUSAK = "cubic-bezier(0.16, 1, 0.3, 1)";
/** Blok basina baslangic gecikmesi: bloklar ust uste binmeden siralanir. */
const ADIM_MS = 650;
/** Acilis kipinde her sey ters giderse icerik en gec bu surede acilir. */
const EMNIYET_MS = 14000;

type Nokta = { x: number; y: number };
type Kutu = { x: number; y: number; w: number; h: number };
type Kip = "acilis" | "kaydirma";

/**
 * Bir ogenin bolume gore yerlesim kutusu. getBoundingClientRect yerine
 * offsetLeft/Top zinciri kullaniliyor: o degerler transform'u (giris
 * animasyonlarinin kaymasini) icermez, bu yuzden bloklar daha giris hareketi
 * bitmeden de dogru olculur.
 */
function yerlesim(oge: HTMLElement, bolum: HTMLElement): Kutu {
  let x = 0;
  let y = 0;
  let e: HTMLElement | null = oge;
  while (e && e !== bolum) {
    x += e.offsetLeft;
    y += e.offsetTop;
    e = e.offsetParent as HTMLElement | null;
  }
  if (e === bolum) return { x, y, w: oge.offsetWidth, h: oge.offsetHeight };

  // Zincir bolume ulasmadiysa (alisilmadik konumlandirma) ekran olcusune don.
  const b = bolum.getBoundingClientRect();
  const r = oge.getBoundingClientRect();
  return { x: r.left - b.left, y: r.top - b.top, w: r.width, h: r.height };
}

/**
 * Bloğun icerigine sikica oturan kutusu. `kutu` kipinde ogenin kendisi; aksi
 * halde yaprak ogelerden (cocugu olmayanlar: kelime kapsayicilari, dugmeler)
 * yatay olcu alinir — blok seviyesindeki ara ogeler (max-w-5xl gibi) metinden
 * cok daha genis oluyor ve cerceve bos alana tasiyordu.
 */
function kutuOlc(oge: HTMLElement, bolum: HTMLElement): Kutu {
  const kendi = yerlesim(oge, bolum);
  let { x, w } = kendi;

  if (oge.dataset.insa !== "kutu") {
    const yapraklar = Array.from(oge.querySelectorAll<HTMLElement>("*")).filter(
      (e) => !e.firstElementChild,
    );
    if (yapraklar.length > 0) {
      const kutular = yapraklar.map((e) => yerlesim(e, bolum));
      const sol = Math.min(...kutular.map((k) => k.x));
      const sag = Math.max(...kutular.map((k) => k.x + k.w));
      // Yapraklar bos donmusse (0 genislik) kendi olcusune guven.
      if (sag - sol > 0) {
        x = sol;
        w = sag - sol;
      }
    }
  }

  const pay = 10;
  return { x: x - pay, y: kendi.y - pay / 2, w: w + pay * 2, h: kendi.h + pay };
}

/** Bu sayfa yuklemesinde efekt calisabilir mi? */
function calisabilir(kip: Kip): boolean {
  const html = document.documentElement;
  if (!html.hasAttribute("data-insa-aktif")) return false;
  if (kip === "acilis" && html.getAttribute("data-insa-durum") !== "calisiyor") {
    return false;
  }
  // Sayfalar arasi gecisle ana sayfaya geri donuldu: efekt zaten oynadi.
  if (window.__insaBitti) return false;
  return true;
}

export default function InsaKatmani({ kip = "kaydirma" }: { kip?: Kip }) {
  const kokRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const kok = kokRef.current;
    const bolum = kok?.parentElement;
    const html = document.documentElement;
    if (!kok || !bolum) return;

    const hedefler = Array.from(
      bolum.querySelectorAll<HTMLElement>("[data-insa]"),
    );
    const goster = (oge: HTMLElement) => oge.setAttribute("data-insa-hazir", "");

    if (!calisabilir(kip)) {
      hedefler.forEach(goster);
      return;
    }
    // Strict Mode'un ilk temizliginden kalan "hazir" isaretlerini sifirla.
    hedefler.forEach((e) => e.removeAttribute("data-insa-hazir"));

    const animasyonlar = new Set<Animation>();
    const zamanlayicilar = new Set<number>();
    let bitti = false;

    const bekle = (ms: number) =>
      new Promise<void>((coz) => {
        const id = window.setTimeout(() => {
          zamanlayicilar.delete(id);
          coz();
        }, ms * HIZ);
        zamanlayicilar.add(id);
      });

    /** WAAPI animasyonu baslatir; iptal edilirse sessizce biter. */
    const oyna = (
      oge: HTMLElement,
      kareler: Keyframe[],
      secenek: KeyframeAnimationOptions,
    ) => {
      const a = oge.animate(kareler, {
        fill: "forwards",
        ...secenek,
        duration: Number(secenek.duration ?? 0) * HIZ,
      });
      animasyonlar.add(a);
      return a.finished.catch(() => undefined).then(() => a);
    };

    const tasi = async (oge: HTMLElement, a: Nokta, b: Nokta, ms: number) => {
      const anim = await oyna(
        oge,
        [
          { transform: `translate(${a.x}px, ${a.y}px)` },
          { transform: `translate(${b.x}px, ${b.y}px)` },
        ],
        { duration: ms, easing: YUMUSAK },
      );
      if (!bitti) {
        oge.style.transform = `translate(${b.x}px, ${b.y}px)`;
        anim.cancel();
      }
    };

    const imlecYap = (renk: string, ad: string) => {
      const oge = document.createElement("div");
      oge.setAttribute("aria-hidden", "true");
      oge.style.cssText =
        "position:absolute;left:0;top:0;z-index:2;will-change:transform;opacity:0;transition:opacity .25s";
      oge.innerHTML =
        `<svg width="22" height="22" viewBox="0 0 22 22" style="display:block;filter:drop-shadow(0 2px 6px rgba(0,0,0,.45))">` +
        `<path d="M3 2l14 6.2-5.6 1.7L9.7 15.6z" fill="${renk}" stroke="#06111a" stroke-width="1.2" stroke-linejoin="round"/></svg>` +
        `<span style="position:absolute;left:16px;top:16px;padding:2px 8px;border-radius:999px;background:${renk};color:#06111a;font:600 11px/1.5 var(--yazi-body),system-ui,sans-serif;white-space:nowrap">${ad}</span>`;
      kok.appendChild(oge);
      return oge;
    };

    /**
     * Cizgisel cerceve: dolgu ve tutamac yok, 1px kenar; bloğun dort kenarindan
     * tum sahneye uzanan ince kilavuz cizgileri (tasarim araclarindaki ruler
     * guide'lar) imlecle birlikte belirir.
     */
    const cerceveYap = (k: Kutu, renk: string) => {
      const oge = document.createElement("div");
      oge.setAttribute("aria-hidden", "true");
      oge.style.cssText =
        `position:absolute;left:${k.x}px;top:${k.y}px;width:${k.w}px;height:${k.h}px;` +
        `border:1px solid ${renk};clip-path:inset(0 100% 100% 0);z-index:1`;
      kok.appendChild(oge);

      const kilavuz = (stil: string) => {
        const g = document.createElement("div");
        g.setAttribute("aria-hidden", "true");
        g.style.cssText = `position:absolute;background:${renk};opacity:0;${stil}`;
        kok.appendChild(g);
        return g;
      };
      const b = { w: bolum.offsetWidth, h: bolum.offsetHeight };
      const kilavuzlar = [
        kilavuz(`left:0;top:${k.y}px;width:${b.w}px;height:1px`),
        kilavuz(`left:0;top:${k.y + k.h}px;width:${b.w}px;height:1px`),
        kilavuz(`left:${k.x}px;top:0;width:1px;height:${b.h}px`),
        kilavuz(`left:${k.x + k.w}px;top:0;width:1px;height:${b.h}px`),
      ];
      return { oge, kilavuzlar };
    };

    /**
     * Tek bir blogu insa eder: imlec gelir, kosegen suruklenerek cerceve cizilir,
     * sonra imlec alt kenar boyunca giderken blok soldan saga acilir.
     * `onBekleme` insaya baslamadan once beklenecek sure (HIZ'dan once).
     */
    const insaEt = async (oge: HTMLElement, sira: number, onBekleme: number) => {
      const ajan = AJANLAR[sira % INSA_AJANI];
      await bekle(onBekleme);
      if (bitti) return;

      const k = kutuOlc(oge, bolum);
      const sol: Nokta = { x: k.x, y: k.y };
      const sag: Nokta = { x: k.x + k.w, y: k.y + k.h };

      const imlec = imlecYap(ajan.renk, ajan.ad);
      // Imlec bloga yakin bir kenardan gelir (bolum cok uzunsa bile gorunur kalsin).
      const basla: Nokta = {
        x: sira % 2 === 0 ? -40 : bolum.offsetWidth + 20,
        y: k.y + (sira % 2 === 0 ? -90 : 110),
      };
      imlec.style.transform = `translate(${basla.x}px, ${basla.y}px)`;
      imlec.style.opacity = "1";

      await tasi(imlec, basla, sol, 650);
      if (bitti) return;

      // Kosegen surukleme: cerceve imlecle ayni egri ve surede buyur.
      const { oge: cerceve, kilavuzlar } = cerceveYap(k, ajan.renk);
      kilavuzlar.forEach((g) =>
        oyna(g, [{ opacity: 0 }, { opacity: 0.28 }], { duration: 450 }),
      );
      await Promise.all([
        tasi(imlec, sol, sag, 450),
        oyna(
          cerceve,
          [
            { clipPath: "inset(0 100% 100% 0)" },
            { clipPath: "inset(0 0% 0% 0)" },
          ],
          { duration: 450, easing: YUMUSAK },
        ),
      ]);
      if (bitti) return;
      await bekle(140);
      if (bitti) return;

      // Yazma hissi: imlec alt kenari boyunca soldan saga giderken blok acilir.
      const altSol: Nokta = { x: k.x, y: k.y + k.h };
      await tasi(imlec, sag, altSol, 160);
      if (bitti) return;
      const sure = Math.min(900, Math.max(420, k.w * 0.9));
      goster(oge);
      const [, silme] = await Promise.all([
        tasi(imlec, altSol, sag, sure),
        oyna(
          oge,
          [
            { clipPath: "inset(-12px 100% -12px -12px)" },
            { clipPath: "inset(-12px -12px -12px -12px)" },
          ],
          { duration: sure, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
        ),
      ]);
      // Silme bitti: kirpmayi kaldir, yoksa blogun disina tasan golge/parlama
      // (telefonun arka isigi gibi) kalici olarak kesik kalir.
      if (!bitti) silme.cancel();
      if (bitti) return;

      oyna(cerceve, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 });
      kilavuzlar.forEach((g) =>
        oyna(g, [{ opacity: 0.28 }, { opacity: 0 }], { duration: 350 }),
      );
      await bekle(250);
      imlec.style.opacity = "0";
      await bekle(300);
      // Is bitti: bu blogun elemanlarini sahneden kaldir.
      cerceve.remove();
      kilavuzlar.forEach((g) => g.remove());
      imlec.remove();
    };

    /* ----------------------------- ACILIS KIPI ----------------------------- */
    let temizlikEkle: (() => void) | undefined;

    if (kip === "acilis") {
      const bitir = () => {
        if (bitti) return;
        bitti = true;
        zamanlayicilar.forEach((id) => window.clearTimeout(id));
        animasyonlar.forEach((a) => a.cancel());
        hedefler.forEach(goster);
        window.__insaBitti = true;
        window.removeEventListener("wheel", bitir);
        window.removeEventListener("touchstart", bitir);
        window.removeEventListener("keydown", bitir);
        kok.style.transition = "opacity .3s";
        kok.style.opacity = "0";
        window.setTimeout(() => {
          kok.replaceChildren();
          html.setAttribute("data-insa-durum", "bitti");
        }, 320);
      };

      // Atla dugmesi
      const atla = document.createElement("button");
      atla.type = "button";
      atla.textContent = "Atla";
      atla.style.cssText =
        "position:absolute;left:50%;bottom:28px;transform:translateX(-50%);pointer-events:auto;z-index:3;" +
        "padding:8px 18px;border-radius:999px;border:1px solid #345064;background:#06111acc;" +
        "color:#f4f6f2;font:600 13px/1 var(--yazi-body),system-ui,sans-serif;cursor:pointer";
      atla.addEventListener("click", bitir);
      kok.appendChild(atla);

      window.addEventListener("wheel", bitir, { passive: true });
      window.addEventListener("touchstart", bitir, { passive: true });
      window.addEventListener("keydown", bitir);

      /** Bloklari insa etmeyen ajanlar: sahnede rastgele gezinir, is yapiyormus gibi gorunur. */
      const gezginler: HTMLElement[] = [];
      const gez = async (sira: number) => {
        const ajan = AJANLAR[INSA_AJANI + sira];
        await bekle(200 + sira * 450);
        if (bitti) return;
        const imlec = imlecYap(ajan.renk, ajan.ad);
        gezginler.push(imlec);
        const h = bolum.offsetHeight;
        const w = bolum.offsetWidth;
        let su: Nokta = {
          x: sira % 2 === 0 ? w + 20 : -40,
          y: h * (0.2 + 0.2 * sira),
        };
        imlec.style.transform = `translate(${su.x}px, ${su.y}px)`;
        imlec.style.opacity = "1";
        while (!bitti) {
          const hedef: Nokta = {
            x: w * (0.08 + Math.random() * 0.8),
            y: h * (0.15 + Math.random() * 0.7),
          };
          await tasi(imlec, su, hedef, 1100 + Math.random() * 900);
          su = hedef;
          await bekle(150 + Math.random() * 500);
        }
      };

      const emniyet = window.setTimeout(bitir, EMNIYET_MS);
      zamanlayicilar.add(emniyet);

      AJANLAR.slice(INSA_AJANI).forEach((_, i) => void gez(i));

      Promise.all(
        hedefler.map((oge, i) => insaEt(oge, i, 300 + i * ADIM_MS)),
      ).then(() => {
        if (bitti) return;
        gezginler.forEach((g) => (g.style.opacity = "0"));
        bekle(350).then(bitir);
      });

      temizlikEkle = () => {
        window.removeEventListener("wheel", bitir);
        window.removeEventListener("touchstart", bitir);
        window.removeEventListener("keydown", bitir);
      };
    } else {
      /* --------------------------- KAYDIRMA KIPI --------------------------- */
      // Her blok gorus alanina girince siraya alinir; ayni anda girenler
      // ADIM_MS arayla baslar ki imlecler ust uste binmesin.
      let sonBaslama = 0;
      let sayac = 0;
      const gozlemci = new IntersectionObserver(
        (girdiler) => {
          for (const g of girdiler) {
            if (!g.isIntersecting) continue;
            gozlemci.unobserve(g.target);
            const simdi = performance.now();
            const bekleme = Math.max(0, sonBaslama + ADIM_MS * HIZ - simdi);
            sonBaslama = simdi + bekleme;
            void insaEt(g.target as HTMLElement, sayac++, 100 + bekleme / HIZ);
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
      );
      hedefler.forEach((e) => gozlemci.observe(e));
      temizlikEkle = () => gozlemci.disconnect();
    }

    return () => {
      // Strict Mode'da ya da sayfadan cikinca: her seyi geri al.
      bitti = true;
      zamanlayicilar.forEach((id) => window.clearTimeout(id));
      animasyonlar.forEach((a) => a.cancel());
      temizlikEkle?.();
      hedefler.forEach(goster);
      kok.replaceChildren();
      kok.style.opacity = "";
      kok.style.transition = "";
    };
  }, [kip]);

  return (
    <div
      ref={kokRef}
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden"
    />
  );
}

/**
 * Sayfa cizilmeden once calisan kapi. Gerekirse `html`e durum yazar; CSS bu
 * duruma bakip bloklari gizler. Her tam sayfa yuklemesinde oynar.
 */
export function InsaKapi() {
  const betik =
    "try{var d=document.documentElement;" +
    "if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&scrollY<40&&!location.hash)" +
    "{d.setAttribute('data-insa-aktif','');d.setAttribute('data-insa-durum','calisiyor')}}catch(e){}";
  return <script dangerouslySetInnerHTML={{ __html: betik }} />;
}
