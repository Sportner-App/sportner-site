import type { Metadata } from "next";

/** Panel arama motorlarına kapalı; adres paylaşılsa bile içerik API yetkisiyle korunuyor. */
export const metadata: Metadata = {
  title: "Yönetim",
  robots: { index: false, follow: false, nocache: true },
  alternates: { canonical: null },
};

export default function YonetimDuzeni({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="min-h-svh">{children}</main>;
}
