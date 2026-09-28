#!/usr/bin/env python3
"""Sportner sitesini content/*.md dosyalarindan uretir.

Kullanim:  python3 build.py

Markdown'in tamamini degil, hukuki metinlerde fiilen kullandigimiz alt
kumesini isler: basliklar, kalin, baglanti, satir ici kod, liste, tablo,
yatay cizgi ve paragraf. Girdi bize ait oldugu icin bu yeterli; disaridan
metin eklenecekse once buraya destek eklemek gerekir.
"""

import html
import os
import re
import shutil

KOK = os.path.dirname(os.path.abspath(__file__))
ICERIK = os.path.join(KOK, "content")

SAYFALAR = [
    # (kaynak dosya, cikis klasoru, <title>, description)
    ("index.md",     "",          "Sportner",
     "Şehrindeki spor etkinliklerini bul, katıl, kendi etkinliğini oluştur."),
    ("destek.md",    "destek",    "Destek — Sportner",
     "Sportner için yardım, sık sorulan sorular ve iletişim."),
    ("gizlilik.md",  "gizlilik",  "Gizlilik Politikası — Sportner",
     "Sportner'ın hangi verileri topladığı, neden topladığı ve senin kontrolün."),
    ("kvkk.md",      "kvkk",      "KVKK Aydınlatma Metni — Sportner",
     "6698 sayılı KVKK kapsamında Sportner aydınlatma metni."),
]

SABLON = """<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
<meta name="color-scheme" content="dark">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:type" content="website">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%2306111a'/><circle cx='16' cy='16' r='7' fill='none' stroke='%23ccff00' stroke-width='2.5'/></svg>">
<style>
  :root {{
    --bg: #06111a;
    --bg-raised: #0d1b27;
    --line: #203443;
    --line-strong: #345064;
    --ink: #f4f6f2;
    --ink-muted: #a8b2b8;
    --accent: #ccff00;
  }}
  * {{ box-sizing: border-box; }}
  html {{ -webkit-text-size-adjust: 100%; }}
  body {{
    margin: 0;
    background: var(--bg);
    color: var(--ink);
    font: 16px/1.7 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
          "Helvetica Neue", Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }}
  .wrap {{ max-width: 720px; margin: 0 auto; padding: 0 16px 96px; }}

  header {{
    border-bottom: 1px solid var(--line);
    margin-bottom: 40px;
    padding: 20px 0;
  }}
  .bar {{
    max-width: 720px; margin: 0 auto; padding: 0 16px;
    display: flex; align-items: center; gap: 20px; flex-wrap: wrap;
  }}
  .logo {{
    font-weight: 700; font-size: 17px; letter-spacing: -0.2px;
    color: var(--ink); text-decoration: none; margin-right: auto;
  }}
  .logo span {{ color: var(--accent); }}
  .bar a.nav {{
    color: var(--ink-muted); text-decoration: none; font-size: 14px;
  }}
  .bar a.nav:hover, .bar a.nav[aria-current] {{ color: var(--accent); }}

  h1 {{ font-size: 32px; line-height: 1.25; letter-spacing: -0.5px; margin: 0 0 8px; }}
  h2 {{
    font-size: 21px; line-height: 1.35; letter-spacing: -0.2px;
    margin: 48px 0 14px; padding-top: 4px;
  }}
  h3 {{ font-size: 16px; margin: 28px 0 8px; color: var(--accent); }}
  p {{ margin: 0 0 16px; }}
  a {{ color: var(--accent); }}
  strong {{ color: #fff; font-weight: 600; }}
  hr {{ border: 0; border-top: 1px solid var(--line); margin: 40px 0; }}
  ul {{ margin: 0 0 16px; padding-left: 22px; }}
  li {{ margin-bottom: 6px; }}
  code {{
    background: var(--bg-raised); border: 1px solid var(--line);
    border-radius: 5px; padding: 1px 5px; font-size: 13px;
  }}
  .lede {{ color: var(--ink-muted); font-size: 15px; margin-bottom: 40px; }}

  .tablo {{ overflow-x: auto; margin: 0 0 20px; }}
  table {{ border-collapse: collapse; width: 100%; font-size: 14.5px; }}
  th, td {{
    text-align: left; padding: 10px 14px 10px 0;
    border-bottom: 1px solid var(--line); vertical-align: top;
  }}
  th {{ color: var(--ink-muted); font-weight: 600; white-space: nowrap; }}

  footer {{
    border-top: 1px solid var(--line); margin-top: 72px; padding-top: 24px;
    color: var(--ink-muted); font-size: 13.5px;
  }}
  footer a {{ color: var(--ink-muted); }}
  footer a:hover {{ color: var(--accent); }}

  @media (max-width: 600px) {{
    h1 {{ font-size: 26px; }}
    h2 {{ font-size: 19px; margin-top: 40px; }}
    .bar {{ gap: 14px; }}
  }}
</style>
</head>
<body>
<header><div class="bar">
  <a class="logo" href="/">sportner<span>.</span></a>
  <a class="nav" href="/destek/">Destek</a>
  <a class="nav" href="/gizlilik/">Gizlilik</a>
  <a class="nav" href="/kvkk/">KVKK</a>
</div></header>
<main class="wrap">
{body}
<footer>
  <p>Sportner — Yağız Erdenler<br>
  <a href="mailto:destek@sportner.app">destek@sportner.app</a></p>
  <p><a href="/gizlilik/">Gizlilik Politikası</a> · <a href="/kvkk/">KVKK Aydınlatma Metni</a> · <a href="/destek/">Destek</a></p>
</footer>
</main>
</body>
</html>
"""


def satir_ici(s):
    """Kalin, baglanti, satir ici kod. Once kacis, sonra isaretleme."""
    s = html.escape(s, quote=False)
    s = re.sub(r"`([^`]+)`", r"<code>\1</code>", s)
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', s)
    return s


def tablo_cevir(satirlar):
    basliklar = [h.strip() for h in satirlar[0].strip().strip("|").split("|")]
    govde = []
    for ham in satirlar[2:]:
        govde.append([c.strip() for c in ham.strip().strip("|").split("|")])
    out = ['<div class="tablo"><table><thead><tr>']
    out += ["<th>%s</th>" % satir_ici(b) for b in basliklar]
    out.append("</tr></thead><tbody>")
    for satir in govde:
        out.append("<tr>" + "".join("<td>%s</td>" % satir_ici(c) for c in satir) + "</tr>")
    out.append("</tbody></table></div>")
    return "".join(out)


def cevir(md):
    satirlar = md.split("\n")
    out, i, ilk_paragraf = [], 0, True

    while i < len(satirlar):
        s = satirlar[i]
        cip = s.strip()

        if not cip:
            i += 1
            continue

        if cip.startswith("---") and set(cip) == {"-"}:
            out.append("<hr>")
            i += 1
            continue

        basl = re.match(r"^(#{1,3})\s+(.*)$", cip)
        if basl:
            d = len(basl.group(1))
            out.append("<h%d>%s</h%d>" % (d, satir_ici(basl.group(2)), d))
            i += 1
            continue

        # Tablo: baslik satiri + ayirici + govde
        if cip.startswith("|") and i + 1 < len(satirlar) and re.match(
                r"^\|[\s:|-]+\|$", satirlar[i + 1].strip()):
            blok = []
            while i < len(satirlar) and satirlar[i].strip().startswith("|"):
                blok.append(satirlar[i])
                i += 1
            out.append(tablo_cevir(blok))
            continue

        if cip.startswith("- "):
            ogeler = []
            while i < len(satirlar) and satirlar[i].strip().startswith("- "):
                parca = [satirlar[i].strip()[2:]]
                i += 1
                # devam satirlari (girintili)
                while (i < len(satirlar) and satirlar[i].startswith("  ")
                       and satirlar[i].strip() and not satirlar[i].strip().startswith("- ")):
                    parca.append(satirlar[i].strip())
                    i += 1
                ogeler.append(" ".join(parca))
            out.append("<ul>" + "".join("<li>%s</li>" % satir_ici(o) for o in ogeler) + "</ul>")
            continue

        # Paragraf: bos satira kadar topla
        parca = []
        while i < len(satirlar) and satirlar[i].strip() and not re.match(
                r"^(#{1,3}\s|[-|]|\* )", satirlar[i].strip()):
            parca.append(satirlar[i].strip())
            i += 1
        if parca:
            sinif = ' class="lede"' if ilk_paragraf and out and out[0].startswith("<h1") else ""
            out.append("<p%s>%s</p>" % (sinif, satir_ici(" ".join(parca))))
            ilk_paragraf = False

    return "\n".join(out)


def main():
    uretilen = []
    for kaynak, klasor, baslik, aciklama in SAYFALAR:
        yol = os.path.join(ICERIK, kaynak)
        if not os.path.exists(yol):
            print("ATLANDI (yok): %s" % kaynak)
            continue

        with open(yol, encoding="utf-8") as f:
            govde = cevir(f.read())

        hedef_dizin = os.path.join(KOK, klasor) if klasor else KOK
        os.makedirs(hedef_dizin, exist_ok=True)
        hedef = os.path.join(hedef_dizin, "index.html")

        with open(hedef, "w", encoding="utf-8") as f:
            f.write(SABLON.format(
                title=html.escape(baslik, quote=True),
                description=html.escape(aciklama, quote=True),
                body=govde))

        uretilen.append((os.path.relpath(hedef, KOK), os.path.getsize(hedef)))

    # GitHub Pages: Jekyll'i devre disi birak, ozel alan adini bildir.
    with open(os.path.join(KOK, ".nojekyll"), "w") as f:
        f.write("")
    with open(os.path.join(KOK, "CNAME"), "w") as f:
        f.write("sportner.app\n")

    print("Uretildi:")
    for yol, boyut in uretilen:
        print("  %-24s %6.1f KB" % (yol, boyut / 1024))
    print("  CNAME, .nojekyll")


if __name__ == "__main__":
    main()
