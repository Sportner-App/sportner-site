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
export const KULLANICI_DURUMU: Record<number, { ad: string; sinif: string; rozet: string }> = {
  0: { ad: "Doğrulama bekliyor", sinif: "text-soft", rozet: "bg-soft/10 text-muted ring-soft/25" },
  1: { ad: "Aktif", sinif: "text-lime", rozet: "bg-lime/10 text-lime ring-lime/25" },
  2: { ad: "Askıda", sinif: "text-tenis", rozet: "bg-tenis/10 text-tenis ring-tenis/25" },
  3: { ad: "Banlı", sinif: "text-basketbol", rozet: "bg-basketbol/10 text-basketbol ring-basketbol/30" },
  4: { ad: "Silinmiş", sinif: "text-soft", rozet: "bg-soft/10 text-soft ring-soft/20" },
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
  reportsByCount: number;
  blockedCount: number;
  blockedByCount: number;
  feedbackCount: number;
  isTestAccount: boolean;
};

/** Kullanıcının açık (yenilenebilir) oturumu; admin panel oturumu (`Oturum`) ile karışmasın. */
export type KullaniciOturumu = {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  lastRotatedAt: string | null;
};

export type DuyuruSecenekleri = {
  cities: string[];
  sports: { id: string; name: string }[];
};

export type DuyuruOnizleme = { recipientCount: number };

export type DuyuruSonucu = { sentCount: number };

export const DUYURU_BASLIK_MAX = 65;
export const DUYURU_METIN_MAX = 240;

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
  "report.resolve": "Şikâyeti çözdü",
  "report.reject": "Şikâyeti reddetti",
  "post.hide": "Gönderiyi gizledi",
  "post.unhide": "Gönderiyi geri açtı",
  "comment.hide": "Yorumu gizledi",
  "comment.unhide": "Yorumu geri açtı",
  "event.cancel": "Etkinliği iptal etti",
  "user.test_account": "Test hesabı ayarını değiştirdi",
  "club.visibility": "Kulüp görünürlüğünü değiştirdi",
  "club.close": "Kulübü kapattı",
  "announcement.send": "Duyuru gönderdi",
  "user.revoke_sessions": "Oturumları kapattı",
};

// ---- Şikâyetler ve içerik moderasyonu ----

export type KullaniciRef = {
  id: string;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
};

export type IcerikDurumu =
  | "active"
  | "hidden"
  | "cancelled"
  | "redacted"
  | "flagged"
  | "banned"
  | "missing";

export type SikayetHedefi = {
  exists: boolean;
  owner: KullaniciRef | null;
  preview: string | null;
  imageUrl: string | null;
  state: IcerikDurumu;
  postId: string | null;
  eventId: string | null;
};

export type SikayetKaydi = {
  id: string;
  entityType: number;
  entityId: string;
  reasonCode: string | null;
  reasonName: string | null;
  description: string | null;
  status: number;
  createdAt: string;
  reviewedAt: string | null;
  resolutionNote: string | null;
  reporter: KullaniciRef | null;
  target: SikayetHedefi;
  openReportsOnTarget: number;
};

export type IcerikKaydi = {
  type: number;
  id: string;
  preview: string | null;
  imageUrl: string | null;
  state: IcerikDurumu;
  createdAt: string;
  postId: string | null;
  eventDate: string | null;
};

/** API'deki ReportStatus sayıları. */
export const SIKAYET_DURUMU: Record<number, { ad: string; rozet: string }> = {
  0: { ad: "Bekliyor", rozet: "bg-tenis/10 text-tenis ring-tenis/25" },
  1: { ad: "İnceleniyor", rozet: "bg-lime/10 text-lime ring-lime/25" },
  2: { ad: "Çözüldü", rozet: "bg-soft/10 text-muted ring-soft/25" },
  3: { ad: "Reddedildi", rozet: "bg-soft/10 text-soft ring-soft/20" },
};

/** API'deki ReportEntityType sayıları. */
export const SIKAYET_TURU: Record<number, string> = {
  0: "Kullanıcı",
  1: "Etkinlik",
  2: "Gönderi",
  3: "Yorum",
  4: "Değerlendirme",
  5: "Mesaj",
  6: "Albüm",
};

export const ICERIK_DURUMU: Record<IcerikDurumu, { ad: string; rozet: string }> = {
  active: { ad: "Yayında", rozet: "bg-lime/10 text-lime ring-lime/25" },
  hidden: { ad: "Gizli", rozet: "bg-tenis/10 text-tenis ring-tenis/25" },
  cancelled: { ad: "İptal", rozet: "bg-basketbol/10 text-basketbol ring-basketbol/30" },
  redacted: { ad: "İçerik silindi", rozet: "bg-soft/10 text-muted ring-soft/25" },
  flagged: { ad: "İşaretli", rozet: "bg-tenis/10 text-tenis ring-tenis/25" },
  banned: { ad: "Banlı", rozet: "bg-basketbol/10 text-basketbol ring-basketbol/30" },
  missing: { ad: "Silinmiş", rozet: "bg-soft/10 text-soft ring-soft/20" },
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

/** "3 dk önce", "2 gün önce" gibi kısa göreli zaman; bir aydan eskisi tarih olarak. */
export function gorece(deger: string | null): string {
  if (!deger) {
    return "—";
  }
  const saniye = Math.round((Date.now() - new Date(deger).getTime()) / 1000);
  if (saniye < 60) return "az önce";
  const dakika = Math.round(saniye / 60);
  if (dakika < 60) return `${dakika} dk önce`;
  const saat = Math.round(dakika / 60);
  if (saat < 24) return `${saat} sa önce`;
  const gun = Math.round(saat / 24);
  if (gun < 30) return `${gun} gün önce`;
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" }).format(new Date(deger));
}

// ---- Özet, etkinlikler ve kulüpler ----

export type Ozet = {
  users: { total: number; new24h: number; new7d: number; new30d: number; active24h: number; active7d: number; active30d: number };
  events: { created7d: number; upcoming: number; completed7d: number; cancelled7d: number };
  clubs: { total: number; new7d: number };
  posts: { new7d: number };
  pending: { reports: number; feedback: number };
  signupsByDay: { date: string; count: number }[];
};

export type EtkinlikOzet = {
  id: string;
  title: string;
  status: number;
  eventDate: string;
  createdAt: string;
  organizer: KullaniciRef | null;
  club: { id: string; name: string } | null;
  sportName: string | null;
  cityName: string | null;
  participantCount: number;
  maxParticipants: number | null;
  isTestHosted: boolean;
};

export type EtkinlikKatilimcisi = {
  user: KullaniciRef | null;
  guestName: string | null;
  status: number;
  joinedAt: string | null;
};

export type EtkinlikDetay = EtkinlikOzet & {
  description: string | null;
  district: string | null;
  address: string | null;
  isPaid: boolean;
  feeAmount: number | null;
  isOrganizationOnly: boolean;
  openReports: number;
  totalReports: number;
  participants: EtkinlikKatilimcisi[];
};

export type KulupOzet = {
  id: string;
  name: string;
  imageUrl: string | null;
  isPublic: boolean;
  createdAt: string;
  deletedAt: string | null;
  founder: KullaniciRef | null;
  cityName: string | null;
  memberCount: number;
  eventCount: number;
  isTestFounded: boolean;
};

export type KulupDetay = KulupOzet & {
  description: string | null;
  eventCreationPolicy: number;
  members: { user: KullaniciRef | null; role: number; status: number; joinedAt: string | null }[];
  recentEvents: { id: string; title: string; status: number; eventDate: string }[];
  openReports: number;
};

/** API'deki EventStatus sayıları. */
export const ETKINLIK_DURUMU: Record<number, { ad: string; rozet: string }> = {
  0: { ad: "Taslak", rozet: "bg-soft/10 text-muted ring-soft/25" },
  1: { ad: "Yayında", rozet: "bg-lime/10 text-lime ring-lime/25" },
  2: { ad: "Dolu", rozet: "bg-tenis/10 text-tenis ring-tenis/25" },
  3: { ad: "Tamamlandı", rozet: "bg-soft/10 text-muted ring-soft/25" },
  4: { ad: "İptal", rozet: "bg-basketbol/10 text-basketbol ring-basketbol/30" },
};

/** API'deki ParticipantStatus sayıları. */
export const KATILIMCI_DURUMU: Record<number, string> = {
  0: "Başvurdu",
  1: "Onaylı",
  2: "Reddedildi",
  3: "İptal",
  4: "Katıldı",
  5: "Gelmedi",
  6: "Davetli",
};

/** API'deki OrganizationRole sayıları. */
export const KULUP_ROLU: Record<number, string> = { 0: "Kurucu", 1: "Yönetici", 2: "Üye" };

/** API'deki OrganizationMemberStatus sayıları. */
export const KULUP_UYELIK_DURUMU: Record<number, string> = {
  0: "Başvurdu",
  1: "Onaylı",
  2: "Reddedildi",
  3: "Ayrıldı",
  4: "Engelli",
};

/** API'deki OrganizationEventCreationPolicy sayıları. */
export const KULUP_ETKINLIK_POLITIKASI: Record<number, string> = {
  0: "Tüm üyeler",
  1: "Yalnızca yöneticiler",
};
