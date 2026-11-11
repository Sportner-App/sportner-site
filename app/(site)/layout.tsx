import Altlik from "@/components/Altlik";
import Baslik from "@/components/Baslik";
import ImlecEfekti from "@/components/ImlecEfekti";

/**
 * Herkese açık sayfaların çerçevesi. Kök düzenden ayrıldı ki yönetim paneli
 * (app/admin) başlık, altlık ve imleç efekti olmadan kendi düzeniyle açılsın.
 * Parantezli klasör adresi değiştirmez: /destek/ yine /destek/.
 */
export default function SiteDuzeni({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <a
        href="#icerik"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-lime focus:px-5 focus:py-2.5 focus:font-semibold focus:text-bg"
      >
        İçeriğe geç
      </a>
      <Baslik />
      <main id="icerik">{children}</main>
      <Altlik />
      <ImlecEfekti />
    </>
  );
}
