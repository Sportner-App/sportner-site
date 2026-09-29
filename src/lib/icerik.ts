import { readFile } from "node:fs/promises";
import path from "node:path";

import { marked } from "marked";

/** content/ altindaki yasal metinler. Dosya adi = adres parcasi. */
export type IcerikAdi = "destek" | "gizlilik" | "kvkk";

export type Icerik = {
  /** Metnin ilk `# ` basligi — sayfa basligi ve <title> icin. */
  baslik: string;
  /** Markdown'dan uretilmis HTML. Basligi icermez; sayfa onu ayrica basar. */
  html: string;
};

/**
 * Markdown dosyasini okuyup HTML'e cevirir. Derleme aninda calisir (statik
 * disa aktarim), yani uretilen sayfada Markdown ayristirici yer almaz.
 *
 * Metin duzenleme akisi eskisi gibi: `content/*.md` duzenle, yeniden derle.
 */
export async function icerikOku(ad: IcerikAdi): Promise<Icerik> {
  const ham = await readFile(
    path.join(process.cwd(), "content", `${ad}.md`),
    "utf8",
  );

  const eslesme = ham.match(/^#\s+(.+)$/m);
  if (!eslesme) {
    throw new Error(
      `content/${ad}.md içinde "# Başlık" satırı yok; sayfa başlığı buradan okunuyor.`,
    );
  }

  // Baslik ayri bir eleman olarak basildigi icin Markdown'dan cikariliyor,
  // yoksa sayfada iki kez gorunur.
  const govde = ham.replace(eslesme[0], "");

  return {
    baslik: eslesme[1].trim(),
    html: await marked.parse(govde, { gfm: true, breaks: false }),
  };
}
