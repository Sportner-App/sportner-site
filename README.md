# sportner.app

Sportner'ın tanıtım ve yasal metin sitesi. Statik HTML, GitHub Pages'te
barınıyor, özel alan adı `sportner.app`.

App Store Connect'e verilecek adresler:

| Alan | Adres |
|---|---|
| Privacy Policy URL | `https://sportner.app/gizlilik/` |
| Support URL | `https://sportner.app/destek/` |
| Marketing URL (isteğe bağlı) | `https://sportner.app/` |

## Yapı

```
content/          kaynak metinler (Markdown) — düzenlenecek yer burası
  index.md        ana sayfa
  destek.md       destek + SSS
  gizlilik.md     gizlilik politikası
  kvkk.md         KVKK aydınlatma metni
build.py          content/*.md -> HTML üretir
onizleme.js       yerel önizleme sunucusu
CNAME             özel alan adı (build.py üretir, elle dokunma)
```

Üretilen `index.html` dosyaları depoya dahil — GitHub Pages bir derleme
adımı çalıştırmadığı için bunlar da işlenmeli.

## Metin güncelleme

1. `content/` içindeki Markdown dosyasını düzenle
2. `python3 build.py`
3. Değişiklikleri işle ve gönder

`build.py`, Markdown'ın tamamını değil bu metinlerde kullanılan alt kümesini
işler: başlık, kalın, bağlantı, satır içi kod, liste, tablo, yatay çizgi,
paragraf. Yeni bir söz dizimi kullanacaksan önce `build.py`'ye eklemen gerekir.

## Yerel önizleme

```
node onizleme.js
```

`http://127.0.0.1:8788` adresinde açılır.

## İlk kurulum (bir kez)

### 1. Depoyu GitHub'a gönder

```
git init
git add .
git commit -m "Sportner sitesi: tanıtım, destek ve yasal metinler"
git branch -M main
git remote add origin git@github.com:Sportner-App/sportner-site.git
git push -u origin main
```

### 2. GitHub Pages'i aç

Depo → **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: **main** / **/ (root)**

`CNAME` dosyası depoda olduğu için özel alan adı kendiliğinden dolar.

### 3. Cloudflare DNS

`sportner.app` için şu kayıtları ekle. **Proxy kapalı olmalı** (gri bulut) —
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

### 4. HTTPS

DNS yayıldıktan sonra (genelde dakikalar, en fazla 24 saat) Pages ayarlarında
**Enforce HTTPS** kutusu aktifleşir, işaretle.

`.app` uzantısı tarayıcıların HSTS ön yükleme listesinde, yani HTTPS zorunlu.
Sertifika hazır olmadan site açılmaz — bu normal, beklemek gerekiyor.

## Dikkat: SPF kaydı

Resend zaten `sportner.app` üzerinden işlem e-postası gönderiyor
(`no-reply@sportner.app`) ve Cloudflare Email Routing `destek@sportner.app`
kutusunu işletecek. Bir alan adında **yalnızca bir SPF kaydı** olabilir.

İkisini ayrı TXT kaydı olarak eklersen her ikisi de bozulur ve doğrulama
e-postaları spam'e düşer. Tek satırda birleştir:

```
v=spf1 include:_spf.mx.cloudflare.net include:amazonses.com ~all
```

Resend panelindeki gerçek `include:` değerini oradan al.
