/** @type {import('next').NextConfig} */
const nextConfig = {
  // GitHub Pages statik dosya sunar; Next sunucu tarafi calistirmaz.
  output: "export",

  // App Store Connect'e verilen adresler `/gizlilik/` ve `/destek/` bicimindeki
  // dizin yollari. trailingSlash bunlari `out/gizlilik/index.html` olarak uretir
  // ve adresler birebir korunur. DEGISTIRME.
  trailingSlash: true,

  // Statik disa aktarimda Next'in goruntu optimizasyonu calismaz; gorseller
  // tools/gorselleri-hazirla.mjs ile onceden WebP'ye cevriliyor.
  images: { unoptimized: true },
};

export default nextConfig;
