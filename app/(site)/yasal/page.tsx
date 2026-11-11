import type { Metadata } from "next";

import YasalSayfa from "@/components/YasalSayfa";
import { icerikOku } from "@/lib/icerik";

export async function generateMetadata(): Promise<Metadata> {
  const { baslik } = await icerikOku("yasal");
  return {
    title: baslik,
    description:
      "Sportner hizmet sağlayıcı bilgileri, yer sağlayıcı bildirimi ve " +
      "hukuka aykırı içerik ile telif hakkı ihlali bildirim yolu.",
    alternates: { canonical: "/yasal/" },
  };
}

export default function YasalBilgilerSayfasi() {
  return <YasalSayfa ad="yasal" />;
}
