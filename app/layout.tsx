import type { Metadata, Viewport } from "next";
import { Anybody, Hanken_Grotesk } from "next/font/google";

import Baslik from "@/components/Baslik";
import Altlik from "@/components/Altlik";
import { site } from "@/lib/site";

import "./globals.css";

/** Uygulamanin display yazi tipi. */
const display = Anybody({
  subsets: ["latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--yazi-display",
  display: "swap",
});

/** Uygulamanin govde yazi tipi. */
const govde = Hanken_Grotesk({
  subsets: ["latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--yazi-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.alan),
  title: {
    default: `${site.ad} — ${site.slogan}`,
    template: `%s — ${site.ad}`,
  },
  description: site.aciklama,
  applicationName: site.ad,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: site.alan,
    siteName: site.ad,
    title: `${site.ad} — ${site.slogan}`,
    description: site.aciklama,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: site.ad }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.ad} — ${site.slogan}`,
    description: site.aciklama,
    images: ["/og.jpg"],
  },
  // Google arama sonucunda site simgesi yerine genel bir dunya ikonu
  // cikiyordu: /favicon.ico yoktu ve tarayici/tarayici-botu once orayi
  // ariyor. Boyutlar acikca bildiriliyor, buyuk boy da PWA icin duruyor.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48" },
      { url: "/favicon.png", type: "image/png", sizes: "48x48" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#06111a",
  colorScheme: "dark",
};

export default function KokDuzen({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${display.variable} ${govde.variable}`}>
      <body>
        {/*
          Google, "Sportner" aramasinda bu siteyi baska bir gelistiricinin ayni
          adli uygulamasiyla birlestiriyordu. Yapilandirilmis veri, sitenin
          hangi uygulamaya ait oldugunu acikca soyleyen tek sinyal: uygulama
          kimligi, magaza adresi ve resmi hesaplar burada baglaniyor.
        */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${site.alan}/#kurulus`,
                  name: site.ad,
                  url: site.alan,
                  logo: `${site.alan}/logo.png`,
                  email: site.destekEposta,
                  sameAs: [site.appStore],
                },
                {
                  "@type": "WebSite",
                  "@id": `${site.alan}/#site`,
                  name: site.ad,
                  url: site.alan,
                  inLanguage: "tr-TR",
                  publisher: { "@id": `${site.alan}/#kurulus` },
                },
                {
                  "@type": "MobileApplication",
                  "@id": `${site.alan}/#uygulama`,
                  name: site.ad,
                  url: site.appStore,
                  installUrl: site.appStore,
                  downloadUrl: site.appStore,
                  operatingSystem: "iOS",
                  applicationCategory: "SportsApplication",
                  inLanguage: "tr-TR",
                  description: site.aciklama,
                  image: `${site.alan}/logo.png`,
                  offers: {
                    "@type": "Offer",
                    price: "0",
                    priceCurrency: "TRY",
                  },
                  publisher: { "@id": `${site.alan}/#kurulus` },
                },
              ],
            }),
          }}
        />
        <a
          href="#icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lime focus:px-5 focus:py-2.5 focus:font-semibold focus:text-bg"
        >
          İçeriğe geç
        </a>
        <Baslik />
        <main id="icerik">{children}</main>
        <Altlik />
      </body>
    </html>
  );
}
