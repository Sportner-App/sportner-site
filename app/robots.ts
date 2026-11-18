import type { MetadataRoute } from "next";

import { site } from "@/lib/site";

// `output: export` ile rotanin statik oldugu acikca belirtilmeli; yoksa
// derleme "dynamic not configured" hatasiyla durur.
export const dynamic = "force-static";

// Yalnızca model eğitimi için veri toplayan botlar kapalı. Arama/yanıt
// botları (OAI-SearchBot, ChatGPT-User, PerplexityBot, Claude-SearchBot,
// Googlebot) açık kalır: Sportner yapay zekâ aramalarında görünmeye devam eder.
// robots.txt bir ricadır; uymayan scraper'ları engellemez.
const AI_TRAINING_BOTS = [
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Meta-ExternalAgent",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/admin/" },
      { userAgent: AI_TRAINING_BOTS, disallow: "/" },
    ],
    sitemap: `${site.alan}/sitemap.xml`,
  };
}
