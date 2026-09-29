import type { Metadata } from "next";

import YasalSayfa from "@/components/YasalSayfa";
import { icerikOku } from "@/lib/icerik";

export async function generateMetadata(): Promise<Metadata> {
  const { baslik } = await icerikOku("kvkk");
  return {
    title: baslik,
    description:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Sportner " +
      "aydınlatma metni: işlenen veriler, hukuki sebepler ve ilgili kişi hakları.",
    alternates: { canonical: "/kvkk/" },
  };
}

export default function KvkkSayfasi() {
  return <YasalSayfa ad="kvkk" />;
}
