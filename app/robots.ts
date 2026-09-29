import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// `output: export` ile rotanin statik oldugu acikca belirtilmeli; yoksa
// derleme "dynamic not configured" hatasiyla durur.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.alan}/sitemap.xml`,
  };
}
