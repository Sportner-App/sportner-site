import type { Metadata } from "next";

import YasalSayfa from "@/components/YasalSayfa";
import { icerikOku } from "@/lib/icerik";

export async function generateMetadata(): Promise<Metadata> {
  const { baslik } = await icerikOku("destek");
  return {
    title: baslik,
    description:
      "Sportner destek: sık sorulan sorular, hesap ve bildirim ayarları, " +
      "hesap silme ve iletişim adresi.",
    alternates: { canonical: "/destek/" },
  };
}

export default function DestekSayfasi() {
  return <YasalSayfa ad="destek" />;
}
