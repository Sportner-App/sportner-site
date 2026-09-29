import EkranAkisi from "@/components/EkranAkisi";
import Hero from "@/components/Hero";
import Indir from "@/components/Indir";
import Manifesto from "@/components/Manifesto";
import Ozellikler from "@/components/Ozellikler";
import ParalaksBant from "@/components/ParalaksBant";
import Sporlar from "@/components/Sporlar";

export default function AnaSayfa() {
  return (
    <>
      <Hero />
      <Manifesto />
      <EkranAkisi />

      <ParalaksBant
        gorsel="/foto/kosu.webp"
        gorselSet="/foto/kosu-1200.webp 1200w, /foto/kosu.webp 2000w"
        etiket="Topluluk"
        baslik="Tek başına koşabilirsin. Ama yalnız koşmak zorunda değilsin."
        metin="Sportner'da her etkinliğin arkasında onu açan biri, yanında da o gün tanışacağın bir kadro var."
      />

      <Ozellikler />
      <Sporlar />
      <Indir />
    </>
  );
}
