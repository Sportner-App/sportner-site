import type { Metadata } from "next";

import YasalSayfa from "@/components/YasalSayfa";
import { icerikOku } from "@/lib/icerik";

export async function generateMetadata(): Promise<Metadata> {
  const { baslik } = await icerikOku("gizlilik");
  return {
    title: baslik,
    description:
      "Sportner'ın hangi verileri topladığı, ne için kullandığı, kimlerle " +
      "paylaştığı ve kullanıcı haklarının nasıl işletildiği.",
    alternates: { canonical: "/gizlilik/" },
  };
}

export default function GizlilikSayfasi() {
  return <YasalSayfa ad="gizlilik" />;
}
