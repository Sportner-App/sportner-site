/**
 * Kaynak gorselleri siteye hazirlar: App Store karelerinden ham ekrani keser,
 * fotograflari olceklendirir, hepsini WebP'ye cevirir.
 *
 * Kullanim: npm run gorseller
 *
 * Kaynaklar depoya dahil degil (yuzlerce MB). Script kaynagi bulamazsa o
 * dosyayi atlar ve uyarir; public/ icindeki uretilmis gorseller depoda durur.
 */
import { mkdir, access } from "node:fs/promises";
import { homedir } from "node:os";
import path from "node:path";
import sharp from "sharp";

const KAYNAK = path.join(homedir(), "Desktop/sportner-appstore");
const APPSTORE = path.join(KAYNAK, '6.9"');
const APP = path.join(homedir(), "Desktop/SportnerWorkspace/sportnerApp/assets/images");
const OUT = path.resolve("public");

/** Tam kare fotograflar: [kaynak, cikti, genislikler] */
const fotograflar = [
  [path.join(APP, "sportnerhero.png"), "foto/hero", [2022, 1400, 900]],
  [path.join(APP, "first-launch/community-run-post-v2.png"), "foto/kosu", [2000, 1200]],
];

const varMi = async (p) => access(p).then(() => true, () => false);

async function yaz(pipeline, cikti) {
  await mkdir(path.dirname(cikti), { recursive: true });
  const info = await pipeline.webp({ quality: 82, effort: 5 }).toFile(cikti);
  const kb = Math.round(info.size / 1024);
  console.log(`  ${path.relative(OUT, cikti).padEnd(34)} ${info.width}x${info.height}  ${kb} KB`);
}

console.log("\nFotograflar");
for (const [kaynak, ad, genislikler] of fotograflar) {
  if (!(await varMi(kaynak))) {
    console.warn(`  ! bulunamadi, atlandi: ${kaynak}`);
    continue;
  }
  const asil = (await sharp(kaynak).metadata()).width;
  // Kaynak istenen en buyuk olcuden darsa o olcu uretilmez; taban adi
  // (`hero.webp`) her zaman uretilen en buyuk varyanta verilir ki srcset'te
  // eksik dosyaya referans kalmasin.
  const uretilecek = genislikler.filter((g) => g <= asil);
  if (uretilecek.length === 0) uretilecek.push(asil);
  for (const [i, g] of uretilecek.entries()) {
    const ek = i === 0 ? "" : `-${g}`;
    await yaz(sharp(kaynak).resize({ width: g }), path.join(OUT, `${ad}${ek}.webp`));
  }
}

/**
 * Telefon ekranlari sitede DOM ile yeniden kuruluyor; bu medya o ekranlarin
 * icinde kullaniliyor. Ekran goruntulerindeki fotograflarin uzerinde arayuz
 * oldugu icin temiz kesilemiyor, bu yuzden uygulamanin kendi fotograflari
 * kirpiliyor.
 *
 * [kaynak, cikti, kirpma | null, genislik]
 */
const medya = [
  // Etkinlik kartlari — yatay, ~1.6:1
  [path.join(APP, "first-launch/welcome.png"), "medya/kart-basket", { left: 0, top: 700, width: 853, height: 530 }, 760],
  [path.join(APP, "first-launch/community-run-post-v2.png"), "medya/kart-kosu", { left: 600, top: 0, width: 1100, height: 690 }, 760],

  // Etkinlik detayinin tam ekran arka plani — dikey
  [path.join(APP, "first-launch/welcome.png"), "medya/detay-basket", null, 700],

  // Kesfet akisindaki gonderi — kare benzeri
];

console.log("\nEkran ici medya");
for (const [kaynak, ad, kirpma, genislik] of medya) {
  if (!(await varMi(kaynak))) {
    console.warn(`  ! bulunamadi, atlandi: ${kaynak}`);
    continue;
  }
  let boru = sharp(kaynak);
  if (kirpma) boru = boru.extract(kirpma);
  await yaz(boru.resize({ width: genislik }), path.join(OUT, `${ad}.webp`));
}

// Kesfet akisindaki gonderi: App Store karesindeki pilates fotografi.
// Gorselin kendisi temiz — uzerinde arayuz yok — yalnizca ust seritteki koyu
// bant ve ince kenarlar kirpiliyor.
const gonderiKaynak = path.join(APPSTORE, "appstore-5.png");
if (await varMi(gonderiKaynak)) {
  await yaz(
    sharp(gonderiKaynak)
      .extract({ left: 178, top: 1438, width: 935, height: 925 })
      .resize({ width: 700 }),
    path.join(OUT, "medya/gonderi.webp"),
  );
}

// Harita: yalnizca harita alani. Kaynak App Store karesi degil, simulator
// ekran goruntusu — App Store karesinde iki kume pini gomulu, oysa pinler
// sitede DOM ile cizilip kaydirmayla dusuyor. Ustteki yuzen baslik, mapbox
// imzasi ve sekme cubugu kirpiliyor.
const haritaKaynak = path.join(KAYNAK, "harita-ham.png");
if (await varMi(haritaKaynak)) {
  await yaz(
    sharp(haritaKaynak)
      .extract({ left: 70, top: 610, width: 1030, height: 1460 })
      .resize({ width: 760 }),
    path.join(OUT, "medya/harita.webp"),
  );
} else {
  console.warn(`  ! bulunamadi, atlandi: ${haritaKaynak}`);
}

/**
 * Ekranlardaki kisiler. App Store karelerindeki seed edilmis demo hesaplar —
 * gercek kullanici degil, ayni gorseller App Store listesinde zaten yayinda.
 *
 * Kadro avatarlari appstore-4'teki listeden, "yeni sporcular" satiri
 * appstore-5'ten kirpiliyor; ikisinde de halkanin icindeki foto aliniyor,
 * halkayi site kendi ciziyor.
 */
const avatarlar = [];
for (const [ad, top] of [["selin", 1808], ["kerem", 1973], ["deniz", 2138], ["baris", 2303]] ) {
  avatarlar.push(["appstore-4.png", ad, { left: 258, top, width: 100, height: 100 }]);
}
[264, 390, 516, 642, 768, 894, 1020].forEach((cx, i) => {
  avatarlar.push(["appstore-5.png", `yeni-${i + 1}`, { left: cx - 44, top: 1145, width: 88, height: 88 }]);
});
avatarlar.push(["appstore-5.png", "ece", { left: 208, top: 1303, width: 84, height: 84 }]);

console.log("\nAvatarlar");
for (const [dosya, ad, kirpma] of avatarlar) {
  const kaynak = path.join(APPSTORE, dosya);
  if (!(await varMi(kaynak))) {
    console.warn(`  ! bulunamadi, atlandi: ${kaynak}`);
    continue;
  }
  await yaz(
    sharp(kaynak).extract(kirpma).resize({ width: 128 }),
    path.join(OUT, "avatar", `${ad}.webp`),
  );
}

console.log("\nPaylasim gorseli");
// Sosyal aglar WebP'yi her yerde acmiyor; OG gorseli JPEG kaliyor.
const heroKaynak = path.join(APP, "sportnerhero.png");
if (await varMi(heroKaynak)) {
  const cikti = path.join(OUT, "og.jpg");
  const info = await sharp(heroKaynak)
    .resize({ width: 1200, height: 630, fit: "cover", position: "right" })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(cikti);
  console.log(`  og.jpg${" ".repeat(28)}${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`);
}

console.log("\nLogo");
const ikon = path.join(APP, "icon-removebg.png");
if (await varMi(ikon)) {
  await mkdir(path.join(OUT, "foto"), { recursive: true });
  await sharp(ikon).resize({ width: 256 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, "logo.png"));
  await sharp(ikon).resize({ width: 180 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, "apple-touch-icon.png"));
  await sharp(ikon).resize({ width: 48 }).png({ compressionLevel: 9 }).toFile(path.join(OUT, "favicon.png"));
  console.log("  logo.png / apple-touch-icon.png / favicon.png");
}
