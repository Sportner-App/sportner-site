import type { Metadata } from "next";

import YasalSayfa from "@/components/YasalSayfa";
import { icerikOku } from "@/lib/icerik";

export async function generateMetadata(): Promise<Metadata> {
  const { baslik } = await icerikOku("hesap-silme");
  return {
    title: baslik,
    description:
      "Sportner hesabını nasıl kapatacağın, verilerinin tamamen silinmesini " +
      "nasıl talep edeceğin ve hangi verilerin silindiği.",
    alternates: { canonical: "/hesap-silme/" },
  };
}

export default function HesapSilmeSayfasi() {
  return <YasalSayfa ad="hesap-silme" />;
}
