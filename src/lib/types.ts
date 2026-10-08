export type ApplicationStatus = "pending" | "approved" | "rejected";

export type ApplicationKind = "pass" | "admin_request";

export type ApplicationMessage = {
  id: string;
  authorDiscordId: string;
  authorUsername: string;
  authorRole: "user" | "staff" | "system";
  body: string;
  discordMessageId?: string;
  createdAt: string;
};

export type Application = {
  id: string;
  kind?: ApplicationKind;
  ticketNumber?: number;
  discordId: string;
  discordUsername: string;
  discordAvatar?: string;
  mcNick: string;
  realName: string;
  age: string;
  hobby: string;
  source: string;
  rulesRead: string;
  weekdayHours: string;
  weekendHours: string;
  ideaKnown: string;
  aboutSelf?: string;
  experience?: string;
  plans?: string;
  status: ApplicationStatus;
  rejectReason?: string;
  sourceChannel: "discord" | "website";
  discordChannelId?: string;
  /** Переписка на сайте (как в техподдержке) */
  messages?: ApplicationMessage[];
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
};

export type SupportTicketCategory =
  | "bug"
  | "access"
  | "report"
  | "question"
  | "other";

export type SupportTicketStatus = "open" | "answered" | "closed";

export type SupportMessage = {
  id: string;
  authorDiscordId: string;
  authorUsername: string;
  authorRole: "user" | "staff";
  body: string;
  evidenceUrls?: string[];
  /** ID сообщения в Discord (чтобы не дублировать при синке) */
  discordMessageId?: string;
  createdAt: string;
};

export type SupportTicket = {
  id: string;
  number: number;
  discordId: string;
  discordUsername: string;
  discordAvatar?: string;
  mcNick?: string;
  category: SupportTicketCategory;
  subject: string;
  status: SupportTicketStatus;
  /** Ссылки на доказательства (Imgur, YouTube и т.п.) */
  evidenceUrls?: string[];
  /** Пункт правил (для жалоб) */
  rulePoint?: string;
  /** Когда произошло (ISO), для жалоб */
  incidentAt?: string;
  /** Ник нарушителя (для жалоб) */
  reportedPlayer?: string;
  /** Приватный канал тикета в Discord */
  discordChannelId?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  closedBy?: string;
};

export type SessionUser = {
  id: string;
  discordId: string;
  username: string;
  globalName?: string;
  avatar: string;
  mcNick?: string;
  isAdmin: boolean;
  isModerator: boolean;
  isAdministrator: boolean;
  hasWhitelist: boolean;
  projectRoles?: { key: string; label: string; color: string }[];
};

export type ServerStatus = {
  online: boolean;
  players: { online: number; max: number; list?: string[] };
  tps?: number;
  version?: string;
  motd?: string;
  maintenance?: boolean;
  source: "discord" | "ping" | "solards" | "mcstatus" | "offline";
  discord?: {
    name: string;
    members: number;
    online: number;
  };
};
