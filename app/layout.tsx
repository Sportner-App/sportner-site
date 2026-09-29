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
  icons: {
    icon: "/favicon.png",
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
