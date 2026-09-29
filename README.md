# sportner.app

Sportner'ın tanıtım ve yasal metin sitesi. Next.js ile yazılır, statik olarak
dışa aktarılır, GitHub Pages'te barınır. Özel alan adı `sportner.app`.

App Store Connect'e verilen adresler:

| Alan | Adres |
|---|---|
| Privacy Policy URL | `https://sportner.app/gizlilik/` |
| Support URL | `https://sportner.app/destek/` |
| Marketing URL (isteğe bağlı) | `https://sportner.app/` |

> Bu üç adres **değişmemeli**. `next.config.mjs` içindeki `trailingSlash: true`
> ayarı `out/gizlilik/index.html` gibi dizin yolları ürettiği için adresler
> korunuyor. Ayarı kaldırırsan Apple incelemesindeki bağlantılar kırılır.

## Çalıştırma

```
npm install
npm run dev
```

`http://localhost:3000` adresinde açılır.

## Yapı

```
app/                     sayfalar (App Router)
  page.tsx               ana sayfa — bölümleri sırayla dizer
  destek|gizlilik|kvkk/  content/*.md dosyalarından üretilen metin sayfaları
  layout.tsx             yazı tipleri, meta etiketler, başlık/altlık
  globals.css            renkler, tipografi, yasal metin biçimleri
src/components/          bölüm bileşenleri
src/lib/                 saf yardımcılar (aşağıya bak)
content/                 yasal metinlerin kaynağı (Markdown) — düzenlenecek yer
public/                  üretilmiş görseller, CNAME, favicon
tools/                   görsel hazırlama betiği
```

## Metin güncelleme

Yasal metinler hâlâ Markdown. `content/` içindeki dosyayı düzenle, hepsi bu —
derleme sırasında HTML'e çevrilir.

Her dosyanın ilk satırı `# Başlık` olmalı; sayfa başlığı ve `<title>` oradan
okunur (`src/lib/icerik.ts`).

Ana sayfa metinleri Markdown'da değil, ilgili bileşenin içinde: yerleşimle
iç içe geçtikleri için ayrı tutmak iki ayrı doğruluk kaynağı yaratıyordu.

## Görseller

Kaynak görseller depoda **değil** (yüzlerce MB). `public/` altındaki üretilmiş
WebP dosyaları depoda duruyor ve yayına onlar gidiyor.

Yeniden üretmek gerekirse:

```
npm run gorseller
```

Betik iki yerden okur:

- `sportnerApp/assets/images/` — fotoğraflar ve uygulama ikonu. Ekran içindeki
  etkinlik kartlarının fotoğrafları da buradan kırpılıyor; ekran
  görüntülerindeki fotoğrafların üstünde arayüz olduğu için onlar temiz
  kesilemiyor.
- `~/Desktop/sportner-appstore/6.9"/appstore-4.png` ve `appstore-5.png` —
  kullanıcı avatarları (kadro listesi ve "yeni sporcular" satırı) ile keşfet
  akışındaki pilates fotoğrafı buradan kırpılıyor.
- `~/Desktop/sportner-appstore/harita-ham.png` — simülatörden alınmış bir
  harita karesi. App Store karesi kullanılmıyor, çünkü orada iki küme pini
  görselin içine gömülü; pinler sitede DOM ile çizilip kaydırmayla düşüyor.

Kaynak bulunamazsa o dosya atlanır ve uyarı basılır; `public/` içindekiler
olduğu gibi kalır.

## Telefon ekranları

`src/components/ekranlar/` altındaki beş ekran **görsel değil, gerçek DOM**.
Kaydırdıkça etkinlik kartları sırayla giriyor, harita pinleri yukarıdan düşüp
hafifçe aşarak oturuyor, kadro satırları sağdan kayıyor, kontenjan çubuğu
kendi oranına doluyor.

Ölçüler `cqw` (kap genişliğinin yüzdesi) cinsinden yazıldı; telefon çerçevesi
sayfada hangi boyutta çizilirse çizilsin içerik oranıyla ölçekleniyor ve
hiçbir yerde bulanıklaşmıyor. Tasarım genişliği 390pt kabul edildi, yani
1cqw = 3.9px — bir ölçüyü çevirmek için pt değerini 3.9'a böl.

Animasyon motoru `app/globals.css` sonundaki bölümde. `EkranAkisi` her karede
sahnenin köküne tek bir sayı yazıyor: `--p` (o adımın 0–1 ilerlemesi). Her
eleman `girer` sınıfıyla kendi gecikmesini (`--g`) ve süresini (`--s`)
bildiriyor; `--t` (doğrusal), `--e` (yumuşak biten) ve `--b` (hafif aşan)
değerlerini CSS hesaplıyor. Böylece onlarca eleman için kare başına tek JS
yazımı yetiyor, React yeniden render etmiyor.

Görünmeyen ekranlar `visibility: hidden` oluyor — beşi de bağlı kalıyor ama
yalnızca görünen boyanıyor.

Ekranlardaki kişiler App Store karelerindeki seed edilmiş demo hesaplar —
gerçek kullanıcı değiller, aynı görseller App Store listesinde zaten yayında.
Avatarlar o karelerden kırpılıyor; halkanın **içindeki** foto alınıyor, halkayı
site kendisi çiziyor.

## Kaydırmaya bağlı animasyonlar

`src/lib/kaydirma.ts` içindeki `useIlerlemeStili`, kaydırma ilerlemesini
elemanın stiline her karede elle yazar.

Bunun sebebi motion'un `style={{ opacity: useTransform(scrollYProgress, …) }}`
yolunun kullanılamaması: motion v12 bu değerleri WAAPI ile hızlandırırken bir
**ViewTimeline**'a bağlıyor. O çizelge "eleman ekrandan geçerken" ilerler ve
`useScroll`'a verilen `offset` ile örtüşmeyebilir — sabitlenmiş (`sticky`) bir
sahnede eleman ekranda hiç hareket etmediği için tamamen kayar. Ekran kareleri
yanlış anda beliriyordu.

Zamana bağlı giriş animasyonları (`initial`/`animate`) motion'da kalabilir;
sorun yalnızca kaydırmaya bağlı olanlarda.

Sahnenin geçiş pencereleri `src/lib/sahne.ts` içinde saf fonksiyon olarak
duruyor; tarayıcı olmadan sınanabilir.

## Yayınlama

`main` dalına gönderilen her değişiklik `.github/workflows/deploy.yml` ile
derlenip Pages'e gider.

**Tek seferlik ayar:** Depo → Settings → Pages → Source → **GitHub Actions**.
"Deploy from a branch" seçiliyken akış çalışır ama yayına çıkmaz.

`public/CNAME` dosyası `out/` içine kopyalandığı için özel alan adı korunur.

## Cloudflare DNS

`sportner.app` için gereken kayıtlar. **Proxy kapalı olmalı** (gri bulut) —
turuncu bulut açıkken GitHub sertifika üretemez.

| Tip | Ad | İçerik |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | sportner-app.github.io |

`.app` uzantısı tarayıcıların HSTS ön yükleme listesinde, yani HTTPS zorunlu.
Sertifika hazır olmadan site açılmaz — bu normal, beklemek gerekiyor.

## Dikkat: SPF kaydı

Resend zaten `sportner.app` üzerinden işlem e-postası gönderiyor
(`no-reply@sportner.app`) ve Cloudflare Email Routing `destek@sportner.app`
kutusunu işletiyor. Bir alan adında **yalnızca bir SPF kaydı** olabilir.

İkisini ayrı TXT kaydı olarak eklersen her ikisi de bozulur ve doğrulama
e-postaları spam'e düşer. Tek satırda birleştir:

```
v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all
```

Resend panelindeki gerçek `include:` değerini oradan al.
