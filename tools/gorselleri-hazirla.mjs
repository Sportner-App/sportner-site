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

const APPSTORE = path.join(homedir(), "Desktop/sportner-appstore/6.9\"");
const APP = path.join(homedir(), "Desktop/SportnerWorkspace/sportnerApp/assets/images");
const OUT = path.resolve("public");

/**
 * App Store karelerindeki cihaz cercevesinin ic kenari. Cerceve 1-5 numarali
 * gorsellerde birebir ayni yerde; parlak kenarlik taranarak olculdu.
 */
const EKRAN = { left: 168, top: 652, width: 955, height: 2055 };

/** Telefon ekranlari: 780px genislik, 2x ekranda 390pt'ye denk gelir. */
const ekranlar = [
  ["appstore-1.png", "liste"],
  ["appstore-2.png", "harita"],
  ["appstore-3.png", "detay"],
  ["appstore-4.png", "kadro"],
  ["appstore-5.png", "akis"],
];

/** Tam kare fotograflar: [kaynak, cikti, genislikler] */
const fotograflar = [
  [path.join(APP, "sportnerhero.png"), "foto/hero", [2022, 1400, 900]],
  [path.join(APP, "first-launch/intro-discover.png"), "foto/basketbol", [1100, 700]],
  [path.join(APP, "first-launch/intro-connect.png"), "foto/baglan", [1100, 700]],
  [path.join(APP, "first-launch/intro-move.png"), "foto/hareket", [1100, 700]],
  [path.join(APP, "first-launch/welcome.png"), "foto/karsilama", [1100, 700]],
  [path.join(APP, "first-launch/community-run-post-v2.png"), "foto/kosu", [2000, 1200]],
];

const varMi = async (p) => access(p).then(() => true, () => false);

async function yaz(pipeline, cikti) {
  await mkdir(path.dirname(cikti), { recursive: true });
  const info = await pipeline.webp({ quality: 82, effort: 5 }).toFile(cikti);
  const kb = Math.round(info.size / 1024);
  console.log(`  ${path.relative(OUT, cikti).padEnd(34)} ${info.width}x${info.height}  ${kb} KB`);
}

console.log("Telefon ekranlari (App Store karelerinden kesiliyor)");
for (const [dosya, ad] of ekranlar) {
  const kaynak = path.join(APPSTORE, dosya);
  if (!(await varMi(kaynak))) {
    console.warn(`  ! bulunamadi, atlandi: ${kaynak}`);
    continue;
  }
  await yaz(
    sharp(kaynak).extract(EKRAN).resize({ width: 780 }),
    path.join(OUT, "ekranlar", `${ad}.webp`),
  );
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
