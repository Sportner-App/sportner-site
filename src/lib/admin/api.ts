/**
 * Yönetim panelinin API istemcisi. Site statik yayınlandığı için panel tamamen
 * tarayıcıda çalışır; yetki kontrolünün tamamı API'de (yönetici izin listesi).
 *
 * Oturum sessionStorage'da tutulur: sekme kapanınca biter, başka sitelere sızmaz.
 * Erişim jetonu dolunca yenileme jetonuyla bir kez sessizce yenilenir.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api-production-9004e.up.railway.app";

const OTURUM_ANAHTARI = "sportner-admin-oturum";

export type Oturum = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
};

export class ApiHatasi extends Error {
  constructor(
    message: string,
    readonly durum: number,
  ) {
    super(message);
  }
}

export function oturumuOku(): Oturum | null {
  try {
    const ham = sessionStorage.getItem(OTURUM_ANAHTARI);
    return ham ? (JSON.parse(ham) as Oturum) : null;
  } catch {
    return null;
  }
}

export function oturumuYaz(oturum: Oturum | null) {
  try {
    if (oturum) {
      sessionStorage.setItem(OTURUM_ANAHTARI, JSON.stringify(oturum));
    } else {
      sessionStorage.removeItem(OTURUM_ANAHTARI);
    }
  } catch {
    // Gizli sekme gibi durumlarda depolama yoksa oturum yalnızca bellekte kalır.
  }
}

async function hataMesaji(yanit: Response): Promise<string> {
  try {
    const govde = (await yanit.json()) as { detail?: string; title?: string };
    return govde.detail ?? govde.title ?? `İstek başarısız (${yanit.status}).`;
  } catch {
    return `İstek başarısız (${yanit.status}).`;
  }
}

async function ham(yol: string, secenek: RequestInit = {}, jeton?: string): Promise<Response> {
  const basliklar = new Headers(secenek.headers);
  basliklar.set("Accept", "application/json");
  basliklar.set("Accept-Language", "tr");
  if (secenek.body) {
    basliklar.set("Content-Type", "application/json");
  }
  if (jeton) {
    basliklar.set("Authorization", `Bearer ${jeton}`);
  }

  return fetch(`${API_URL}${yol}`, { ...secenek, headers: basliklar, cache: "no-store" });
}

let yenileniyor: Promise<Oturum | null> | null = null;

async function yenile(oturum: Oturum): Promise<Oturum | null> {
  yenileniyor ??= (async () => {
    const yanit = await ham("/api/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: oturum.refreshToken }),
    });
    const yeni = yanit.ok ? ((await yanit.json()) as Oturum) : null;
    oturumuYaz(yeni);
    return yeni;
  })().finally(() => {
    yenileniyor = null;
  });

  return yenileniyor;
}

/** Oturum düşerse panel giriş ekranına dönsün diye dinlenen olay. */
export const OTURUM_DUSTU = "sportner-admin-oturum-dustu";

export async function istek<T>(yol: string, secenek: RequestInit = {}): Promise<T> {
  let oturum = oturumuOku();
  let yanit = await ham(yol, secenek, oturum?.accessToken);

  if (yanit.status === 401 && oturum) {
    oturum = await yenile(oturum);
    if (oturum) {
      yanit = await ham(yol, secenek, oturum.accessToken);
    }
  }

  if (yanit.status === 401 || yanit.status === 403) {
    oturumuYaz(null);
    window.dispatchEvent(new Event(OTURUM_DUSTU));
    throw new ApiHatasi("Oturum geçersiz ya da bu hesabın yönetici yetkisi yok.", yanit.status);
  }

  if (!yanit.ok) {
    throw new ApiHatasi(await hataMesaji(yanit), yanit.status);
  }

  if (yanit.status === 204 || yanit.status === 202) {
    return undefined as T;
  }

  return (await yanit.json()) as T;
}

/** Giriş uçları jetonsuz çağrılır ve 401'i "kod hatalı" olarak gösterir. */
export async function girisIstegi<T>(yol: string, govde: unknown): Promise<T> {
  const yanit = await ham(yol, { method: "POST", body: JSON.stringify(govde) });
  if (!yanit.ok) {
    throw new ApiHatasi(await hataMesaji(yanit), yanit.status);
  }
  return (yanit.status === 202 || yanit.status === 204 ? undefined : await yanit.json()) as T;
}

// ---- Tipler (API yanıtlarıyla birebir) ----

export type Sayfa<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};

/** API'deki UserStatus sayıları. */
export const KULLANICI_DURUMU: Record<number, { ad: string; sinif: string }> = {
  0: { ad: "Doğrulama bekliyor", sinif: "text-soft" },
  1: { ad: "Aktif", sinif: "text-lime" },
  2: { ad: "Askıda", sinif: "text-tenis" },
  3: { ad: "Banlı", sinif: "text-basketbol" },
  4: { ad: "Silinmiş", sinif: "text-soft" },
};

export type KullaniciOzet = {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  profileImageUrl: string | null;
  status: number;
  createdAt: string;
  lastSeenAt: string | null;
};

export type KullaniciDetay = {
  user: KullaniciOzet;
  city: string | null;
  bio: string | null;
  isAdmin: boolean;
  hasPassword: boolean;
  loginProviders: string[];
  postsCount: number;
  eventsJoined: number;
  eventsOrganized: number;
  friendsCount: number;
  activeSessions: number;
  reportsAgainst: number;
  feedbackCount: number;
};

/** API'deki AppFeedbackStatus sayıları. */
export const GERI_BILDIRIM_DURUMU = { yeni: 0, okundu: 1, cozuldu: 2 } as const;

export type GeriBildirim = {
  id: string;
  content: string;
  status: number;
  createdAt: string;
  adminReply: string | null;
  repliedAt: string | null;
  userId: string;
  username: string | null;
  firstName: string | null;
  email: string | null;
  profileImageUrl: string | null;
};

export type GeriBildirimSayfasi = {
  page: Sayfa<GeriBildirim>;
  counts: { new: number; read: number; resolved: number };
};

export type IslemKaydi = {
  id: string;
  createdAt: string;
  action: string;
  targetType: string;
  targetId: string;
  targetLabel: string | null;
  details: string | null;
  actorUserId: string;
  actorUsername: string | null;
};

export const ISLEM_ADLARI: Record<string, string> = {
  "user.ban": "Kullanıcıyı banladı",
  "user.unban": "Banı kaldırdı",
  "user.remove_avatar": "Profil fotoğrafını kaldırdı",
  "feedback.status": "Geri bildirim durumunu değiştirdi",
  "feedback.reply": "Geri bildirime yanıt gönderdi",
};

export function tarih(deger: string | null): string {
  if (!deger) {
    return "—";
  }
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(deger));
}
