/**
 * Parcali dogrusal ara deger. `giris` kesin artan olmali, `cikis` ile ayni
 * uzunlukta. Aralik disinda uc degere sabitlenir.
 *
 * motion'un useTransform'u da bunu yapiyor; burada elle yapmamizin sebebi
 * EkranAkisi'ndeki aciklamada: motion kaydirmaya bagli opakligi ViewTimeline
 * ile hizlandiriyor ve sabitlenmis (sticky) duzende yanlis zaman cizelgesine
 * bagliyor.
 */
export function araDeger(deger: number, giris: number[], cikis: number[]): number {
  if (deger <= giris[0]) return cikis[0];

  const son = giris.length - 1;
  if (deger >= giris[son]) return cikis[son];

  for (let i = 1; i <= son; i++) {
    if (deger <= giris[i]) {
      const genislik = giris[i] - giris[i - 1];
      const oran = genislik === 0 ? 0 : (deger - giris[i - 1]) / genislik;
      return cikis[i - 1] + (cikis[i] - cikis[i - 1]) * oran;
    }
  }

  return cikis[son];
}
