import { VhlMatchReviewRepository } from "./VhlMatchReviewRepository.js";
import { VhlMatchReviewPolicy } from "./VhlMatchReviewPolicy.js";
import { VhlOnlineProtocolIdResolver } from "./VhlOnlineProtocolIdResolver.js";

export class AdminVhlMatchReviewController {
  constructor({ calendarRepository, repository = new VhlMatchReviewRepository(), policy = new VhlMatchReviewPolicy() }) {
    Object.assign(this, { calendarRepository, repository, policy });
  }
  async executeRoute({ chatId, userId, route }) {
    const reply = (text) => ({ method: "sendMessage", chat_id: chatId, text });
    if (String(chatId) !== String(userId)) return reply("Подтвердить матч можно только в личном чате с ботом.");
    if (!["yes", "no"].includes(route.value)) return reply("Неизвестное решение.");
    const review = await this.repository.findReview(route.playerId);
    if (!this.repository.isCurrent(review)) return reply("Запрос устарел или не найден. Проверьте ID матча в разделе ВХЛ.");
    if (review.status !== "pending") return reply(`Решение уже принято: ${review.status === "approved" ? "подтверждено" : "отклонено"}.`);
    const calendar = await this.calendarRepository.listCalendar();
    const match = calendar.matches.find((item) => item.id === review.expected.id);
    const onlineGameId = match && new VhlOnlineProtocolIdResolver().resolveOnlineGameId(match);
    if (!match || !this.policy.matchesCalendar(review, { ...match, onlineGameId })) return reply("Календарь или ID изменились. Старое подтверждение недействительно.");
    const decision = await this.repository.decideReview(review.id, route.value === "yes" ? "approved" : "rejected", userId);
    if (!decision) return reply("Решение уже принято другим администратором или запрос устарел.");
    return reply(decision.status === "approved" ?
      `ВХЛ: ID ${onlineGameId} подтверждён. В ближайшем цикле воркер повторно проверит страницу и соберёт статистику. Итог придёт отдельным сообщением.` :
      `ВХЛ: ID ${onlineGameId} отклонён. Статистика не загружается. Исправьте ID в разделе ВХЛ online.`);
  }
}
