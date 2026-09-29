import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// `output: export` ile rotanin statik oldugu acikca belirtilmeli; yoksa
// derleme "dynamic not configured" hatasiyla durur.
export const dynamic = "force-static";

/**
 * Statik disa aktarimda `out/sitemap.xml` olarak uretilir.
 * Yollar sondaki egik cizgiyle yazili — next.config.mjs'teki trailingSlash
 * ayariyla uyumlu olmasi icin.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const bugun = new Date();

  return [
    { url: `${site.alan}/`, lastModified: bugun, priority: 1 },
    { url: `${site.alan}/destek/`, lastModified: bugun, priority: 0.7 },
    { url: `${site.alan}/gizlilik/`, lastModified: bugun, priority: 0.5 },
    { url: `${site.alan}/kvkk/`, lastModified: bugun, priority: 0.5 },
  ];
}
