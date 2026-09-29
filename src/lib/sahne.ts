import { araDeger } from "./aradeger";

/** Bir adimin ilerleme uzerindeki penceresi ve ucta olup olmadigi. */
export type Pencere = {
  /** [sonuk, tam, tam, sonuk] — kesin artan, 0–1 arasinda. */
  giris: number[];
  ilk: boolean;
  son: boolean;
};

/**
 * Sabitlenmis sahnede `sira` numarali adimin gorunur oldugu aralik.
 *
 * Gorsel ve metin icin ayri genislikler var. Ekran kareleri birbirine eriyerek
 * gecsin diye pencereleri ust uste biner; metinlerde ayni sey iki basligin
 * yari saydam halde ayni yerde durmasina yol aciyor, o yuzden metin pencereleri
 * neredeyse hic binmez — biri tamamen sonmeden digeri baslamaz.
 */
export function pencere(
  sira: number,
  adet: number,
  tur: "gorsel" | "metin" = "gorsel",
): Pencere {
  const merkez = (sira + 0.5) / adet;
  const yari = 0.5 / adet;

  // dis = pencerenin bittigi yer, ic = tam gorunur duzlugun kenari.
  const [dis, ic] = tur === "gorsel" ? [1.55, 0.45] : [0.95, 0.6];

  const ham = [
    merkez - yari * dis,
    merkez - yari * ic,
    merkez + yari * ic,
    merkez + yari * dis,
  ];

  // Sikistirma yalnizca ilk adimin basini ve son adimin sonunu kirpar. Komsu
  // degerlerin esitlenmemesi icin en az bir tik ara birakiliyor.
  const enAz = 0.0005;
  const giris: number[] = [];
  for (const [i, deger] of ham.entries()) {
    const sinirli = Math.min(1, Math.max(0, deger));
    giris.push(i === 0 ? sinirli : Math.max(sinirli, giris[i - 1] + enAz));
  }

  return { giris, ilk: sira === 0, son: sira === adet - 1 };
}

/**
 * Pencerenin uc degerlerini ilk/son adim icin duzler: ilk kare bolumun en
 * basinda, son kare en sonunda tam gorunur kalir. Aksi halde sahne sabitliyken
 * ilk ve son kare bos ekrana dogru soner ve hata gibi gorunur.
 */
export function uclariDuzle(
  cikis: [number, number, number, number],
  { ilk, son }: Pick<Pencere, "ilk" | "son">,
): number[] {
  return [ilk ? cikis[1] : cikis[0], cikis[1], cikis[2], son ? cikis[2] : cikis[3]];
}

/** Verilen ilerlemede bir adimin opakligi. Sinama ve bilesen ayni yolu kullanir. */
export function adimSaydamligi(
  p: number,
  sira: number,
  adet: number,
  tur: "gorsel" | "metin" = "gorsel",
): number {
  const { giris, ...uc } = pencere(sira, adet, tur);
  return araDeger(p, giris, uclariDuzle([0, 1, 1, 0], uc));
}
