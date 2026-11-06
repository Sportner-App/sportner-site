import Beliren from "./Beliren";
import BolumUst from "./BolumUst";
import InsaKatmani from "./InsaKatmani";

type Ozellik = {
  /** Kartin sag ustundeki mono kategori etiketi. */
  etiket: string;
  baslik: string;
  metin: string;
  simge: React.ReactNode;
};

/** Ince cizgili, uygulamadaki simge dilini izleyen SVG'ler. */
const cizgi = {
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
  stroke: "currentColor",
};

const ozellikler: Ozellik[] = [
  {
    etiket: "keşfet",
    baslik: "Konuma göre sıralı",
    metin: "En yakın maç en üstte. Konum vermezsen şehre ve branşa göre gez.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    ),
  },
  {
    etiket: "filtre",
    baslik: "Seviyene uygun",
    metin: "Her ilanda seviye ve yaş aralığı yazar. Yeni başlayan da ileri seviye de kendi maçını bulur.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="M4 19V11m5 8V5m5 14v-6m5 6V8" />
      </svg>
    ),
  },
  {
    etiket: "organize",
    baslik: "Kendi etkinliğini aç",
    metin: "Mekân, saat, kontenjan — ilan et. Katılımı sen onayla ya da herkese aç.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <rect x="3.5" y="5" width="17" height="15" rx="3" />
        <path d="M8 3v4m8-4v4M3.5 10h17M12 13.5v4m-2-2h4" />
      </svg>
    ),
  },
  {
    etiket: "sohbet",
    baslik: "Grup sohbeti",
    metin: "Her etkinliğin kendi sohbeti var. Saha, forma rengi, geç kalan — hepsi orada.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="M20 13.5a3.5 3.5 0 0 1-3.5 3.5H9l-4 3v-3H5a3.5 3.5 0 0 1-3.5-3.5v-6A3.5 3.5 0 0 1 5 4h11.5A3.5 3.5 0 0 1 20 7.5Z" />
      </svg>
    ),
  },
  {
    etiket: "itibar",
    baslik: "Oyuncu puanı ve rozetler",
    metin: "Oynadıkça profilin dolar. Birlikte oynadıkların puanlar; kadroya girerken işine yarar.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.99 6.75 19.75l1-5.85L3.5 9.75l5.9-.85Z" />
      </svg>
    ),
  },
  {
    etiket: "güvenlik",
    baslik: "Güvende kal",
    metin: "Rahatsız edeni engelle ya da şikâyet et. Engellenen sana yazamaz, etkinliğine giremez.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="M12 3.2 5 6v6c0 4.2 2.9 7.4 7 8.8 4.1-1.4 7-4.6 7-8.8V6Z" />
        <path d="m9.2 12.1 2 2 3.6-3.8" />
      </svg>
    ),
  },
];

export default function Ozellikler() {
  return (
    <section id="ozellikler" className="govde relative py-24 md:py-32">
      <BolumUst no="04" ad="Özellikler" />

      <Beliren>
        <h2 data-insa className="baslik mt-10 max-w-3xl text-[clamp(2.25rem,6.4vw,4.75rem)]">
          Maçı kurmak, oynamaktan <span className="text-lime">zor olmasın.</span>
        </h2>
      </Beliren>

      <ul className="koseli mt-16 grid gap-px border border-line-strong bg-line-strong sm:grid-cols-2 lg:grid-cols-3">
        {ozellikler.map((o, i) => (
          <li key={o.baslik} className="bg-bg">
            <Beliren gecikme={(i % 3) * 0.08} className="h-full">
              <div data-insa="kutu" className="group relative h-full bg-surface/45 p-8 transition-colors duration-500 hover:bg-surface md:p-10">
                {/* Hover'da ust kenardan cizilen lime kilavuz */}
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-lime transition-transform duration-500 group-hover:scale-x-100"
                />
                <div className="flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center border border-line-strong text-lime transition-colors duration-500 group-hover:border-lime">
                    <span className="block size-6">{o.simge}</span>
                  </span>
                  <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-soft">
                    F-{String(i + 1).padStart(2, "0")} · {o.etiket}
                  </span>
                </div>
                <h3 className="mt-8 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-ink">
                  {o.baslik}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{o.metin}</p>
              </div>
            </Beliren>
          </li>
        ))}
      </ul>
      <InsaKatmani />
    </section>
  );
}
