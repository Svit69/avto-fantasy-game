import { VhlMatchReviewPolicy } from "./VhlMatchReviewPolicy.js";
import { VhlMatchReviewMessageFactory } from "./VhlMatchReviewMessageFactory.js";

export class VhlMatchReviewRegistrationService {
  constructor(policy = new VhlMatchReviewPolicy(), messages = new VhlMatchReviewMessageFactory()) {
    Object.assign(this, { policy, messages });
  }
  async registerMismatch({ calendarRepository, match, gameId, sourceMatch, chatId }) {
    const expected = { ...match, onlineGameId: String(gameId) };
    if (!this.policy.createProposal(expected, sourceMatch)) return null;
    const message = await this.messages.createReviewMessage(expected, sourceMatch,
      `ВХЛ: ID ${gameId} требует проверки названия.\nОжидалось: ${match.homeTeam} - ${match.awayTeam}, ${match.startsAt.slice(0, 10)}\n` +
      `На странице: ${sourceMatch.homeTeam} - ${sourceMatch.awayTeam}.\nID сохранён, но данные до подтверждения не загружаются.`);
    await calendarRepository.updateMatchOnlineProtocolId(match.id, String(gameId));
    return { method: "sendMessage", chat_id: chatId, text: message.text, reply_markup: message.reply_markup };
  }
}
