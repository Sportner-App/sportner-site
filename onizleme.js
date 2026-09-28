// Yerel önizleme sunucusu:  node onizleme.js  ->  http://127.0.0.1:8788
// Yalnızca geliştirme için. Yayına çıkan şey bu değil; GitHub Pages'e
// yüklenen statik dosyalar.
const http = require("http");
const fs = require("fs");
const path = require("path");

const KOK = __dirname;
const TIPLER = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p.endsWith("/")) p += "index.html";

    // Kök dışına çıkışı engelle.
    const dosya = path.normalize(path.join(KOK, p));
    if (!dosya.startsWith(KOK)) {
      res.writeHead(403).end("403");
      return;
    }

    fs.readFile(dosya, (err, veri) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>404</h1>");
        return;
      }
      res.writeHead(200, {
        "Content-Type": TIPLER[path.extname(dosya)] || "application/octet-stream",
      });
      res.end(veri);
    });
  })
  .listen(8788, "127.0.0.1", () => console.log("http://127.0.0.1:8788"));
