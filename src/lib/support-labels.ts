import type {
  SupportTicketCategory,
  SupportTicketStatus,
} from "./types";

export const supportCategoryLabels: Record<SupportTicketCategory, string> = {
  bug: "Баг / техпроблема",
  access: "Доступ / аккаунт",
  report: "Жалоба на игрока",
  question: "Вопрос",
  other: "Другое",
};

export const supportStatusLabels: Record<SupportTicketStatus, string> = {
  open: "Открыт",
  answered: "Есть ответ",
  closed: "Закрыт",
};
