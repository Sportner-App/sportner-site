/** Sitenin her yerinde gecen sabitler. Adresler App Store Connect'e verildi. */
export const site = {
  ad: "Sportner",
  alan: "https://sportner.app",
  slogan: "Şehrindeki sporu bul, katıl, oynat.",
  aciklama:
    "Sportner; halı saha, basketbol, koşu, voleybol, yoga ve daha fazlası için " +
    "oyuncu arayanla oynamak isteyeni buluşturan bir topluluk uygulaması. " +
    "Yakınındaki etkinlikleri haritada gör, seviyene uygun olanı seç, katıl.",
  destekEposta: "destek@sportner.app",
} as const;

export const yasalBaglantilar = [
  { ad: "Destek", yol: "/destek/" },
  { ad: "Gizlilik Politikası", yol: "/gizlilik/" },
  { ad: "KVKK Aydınlatma Metni", yol: "/kvkk/" },
] as const;
