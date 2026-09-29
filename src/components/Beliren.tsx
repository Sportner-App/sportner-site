"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Kendinden onceki kardeslerden ne kadar sonra belirsin (saniye). */
  gecikme?: number;
  /** Asagidan mi yoksa yalnizca sonerek mi gelsin. */
  yon?: "asagi" | "yerinde";
  className?: string;
};

/**
 * Gorus alanina girince beliren sarmalayici. Bir kez oynar — kullanici yukari
 * kaydirip geri dondugunde yeniden animasyon calismaz, cunku surekli
 * tekrarlayan giris animasyonu uzun sayfalarda yorucu oluyor.
 *
 * Isletim sisteminde "hareketi azalt" aciksa icerik dogrudan gorunur.
 */
export default function Beliren({
  children,
  gecikme = 0,
  yon = "asagi",
  className,
}: Props) {
  const azalt = useReducedMotion();

  if (azalt) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yon === "asagi" ? 28 : 0 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay: gecikme, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
