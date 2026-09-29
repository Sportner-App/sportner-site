import Beliren from "./Beliren";

type Ozellik = {
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
    baslik: "Konuma göre sıralı",
    metin:
      "Etkinlikler sana olan uzaklığa göre dizilir. Konum izni vermezsen şehir ve spor dalına göre gezmeye devam edersin.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.6" />
      </svg>
    ),
  },
  {
    baslik: "Seviyene uygun",
    metin:
      "Her etkinlikte seviye ve yaş aralığı yazar. Yeni başlayan da ileri seviye de kendi maçını bulur.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="M4 19V11m5 8V5m5 14v-6m5 6V8" />
      </svg>
    ),
  },
  {
    baslik: "Kendi etkinliğini aç",
    metin:
      "Mekânı seç, kontenjanı ve saati belirle, ilan et. Katılım talepleri onayına düşsün ya da doğrudan açık olsun.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <rect x="3.5" y="5" width="17" height="15" rx="3" />
        <path d="M8 3v4m8-4v4M3.5 10h17M12 13.5v4m-2-2h4" />
      </svg>
    ),
  },
  {
    baslik: "Grup sohbeti",
    metin:
      "Her etkinliğin kendi sohbeti var. Saha değişikliği, forma rengi, kim geç kalıyor — hepsi tek yerde.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="M20 13.5a3.5 3.5 0 0 1-3.5 3.5H9l-4 3v-3H5a3.5 3.5 0 0 1-3.5-3.5v-6A3.5 3.5 0 0 1 5 4h11.5A3.5 3.5 0 0 1 20 7.5Z" />
      </svg>
    ),
  },
  {
    baslik: "Oyuncu puanı ve rozetler",
    metin:
      "Katıldıkça profilin dolar. Birlikte oynadığın kişiler değerlendirir, kadroya girerken bu puan işine yarar.",
    simge: (
      <svg viewBox="0 0 24 24" {...cizgi}>
        <path d="m12 3.6 2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.99 6.75 19.75l1-5.85L3.5 9.75l5.9-.85Z" />
      </svg>
    ),
  },
  {
    baslik: "Güvende kal",
    metin:
      "Rahatsız eden kullanıcıyı engelle ya da şikâyet et. Engellenen kişi sana mesaj gönderemez, etkinliğine katılamaz.",
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
    <section id="ozellikler" className="govde py-24 md:py-32">
      <Beliren>
        <p className="etiket">Neler yapabilirsin</p>
        <h2 className="baslik mt-4 max-w-2xl text-[clamp(2rem,5.4vw,3.75rem)]">
          Maçı kurmak, oynamaktan zor olmasın.
        </h2>
      </Beliren>

      <ul className="mt-16 grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
        {ozellikler.map((o, i) => (
          <li key={o.baslik} className="bg-bg">
            <Beliren gecikme={(i % 3) * 0.08} className="h-full">
              <div className="group h-full bg-surface/45 p-8 transition-colors duration-500 hover:bg-surface md:p-10">
                <span className="flex size-11 items-center justify-center rounded-xl border border-line-strong text-lime transition-transform duration-500 group-hover:scale-110">
                  <span className="block size-6">{o.simge}</span>
                </span>
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-ink">
                  {o.baslik}
                </h3>
                <p className="mt-3 leading-relaxed text-muted">{o.metin}</p>
              </div>
            </Beliren>
          </li>
        ))}
      </ul>
    </section>
  );
}
