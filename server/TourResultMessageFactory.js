import { TelegramHtmlTextFormatter } from "./TelegramHtmlTextFormatter.js";
import { TourResultContactFormatter } from "./TourResultContactFormatter.js";
export class TourResultMessageFactory {
  constructor(formatter = new TelegramHtmlTextFormatter(), contacts = new TourResultContactFormatter()) { Object.assign(this, { formatter, contacts }); }
  createWinnerMessage(result, winner) {
    const shared = result.leaders.filter((entry) => entry.place === 1).length > 1;
    return `<b>Поздравляем с победой, ${this.formatter.escapeText(winner.name)}!</b>\n\nТур «${this.formatter.escapeText(result.title)}» завершён. ${shared ? "Вы разделили" : "Вы заняли"} <b>1-е место</b> в итоговой таблице!\n\nРезультат вашего состава: <b>${winner.points} ФО</b>.\n\nСпасибо, что играете в «Собери свой состав». Увидимся в следующем туре!`;
  }
  createAdminMessages(result) {
    const header = `<b>Итоги тура «${this.formatter.escapeText(result.title, 80)}»</b>\nТОП-3 места и контакты участников. При равных ФО место разделяется.\n\n`;
    if (!result.leaders.length) return [`${header}Участников в таблице нет.`];
    const messages = []; let current = header;
    for (const entry of result.leaders) {
      const block = this.contacts.formatContact(entry);
      if (current.length + block.length + 2 > 3500) { messages.push(current.trimEnd()); current = header; }
      current += `${block}\n\n`;
    }
    messages.push(current.trimEnd()); return messages;
  }
  createPendingMessage(tour, missing) {
    const rows = missing.slice(0, 5).map((match) => `${this.formatter.escapeText(match.homeTeam, 32)} — ${this.formatter.escapeText(match.awayTeam, 32)}`).join("\n");
    return `<b>Итоги тура «${this.formatter.escapeText(tour.title || tour.month, 80)}» пока не отправлены.</b>\n${missing.length ? `Не хватает финальных данных по ${missing.length} матчам (ниже до пяти).` : "В календаре нет матчей для подтверждения итогов."}\n${rows}\nПоздравление будет отправлено после получения данных и проверки итоговой таблицы.`;
  }
}
