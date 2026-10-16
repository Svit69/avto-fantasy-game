import { TelegramHtmlTextFormatter } from "./TelegramHtmlTextFormatter.js";
export class TourResultContactFormatter {
  constructor(formatter = new TelegramHtmlTextFormatter()) { this.formatter = formatter; }
  formatContact(entry) {
    const escape = (value, limit = 128) => this.formatter.escapeText(value, limit);
    const id = String(entry.userId);
    const profile = /^\d+$/.test(id) ? `<a href="tg://user?id=${id}">Открыть профиль</a>` : "Профиль недоступен";
    const username = /^[A-Za-z0-9_]{5,32}$/.test(entry.username || "") ? `@${entry.username}` : "username не сохранён";
    return `<b>${entry.place}-е место · ${escape(entry.name)}</b>\n${entry.points} ФО\nTelegram: ${username} · ${profile}\nID: ${escape(id, 32)}\nТелефон: ${escape(entry.phone, 64) || "не указан"}\nEmail: ${escape(entry.email, 160) || "не указан"}`;
  }
}
