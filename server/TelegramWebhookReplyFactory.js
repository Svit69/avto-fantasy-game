import { FantasyScoringGuideText } from "./FantasyScoringGuideText.js";

export class TelegramWebhookReplyFactory {
  constructor(scoringGuide = new FantasyScoringGuideText()) { this.scoringGuide = scoringGuide; }

  createAgreementMessage(chatId) {
    return { method: "sendMessage", chat_id: chatId, text: "Примите пользовательское соглашение.",
      reply_markup: { inline_keyboard: [[{ text: "Принимаю", callback_data: "accept_terms" }]] } };
  }

  createContactRequestMessage(chatId, appUrl) {
    return { method: "sendMessage", chat_id: chatId, text: "Поделитесь номером телефона для регистрации.",
      reply_markup: { keyboard: this.#createMainKeyboard(appUrl, true), resize_keyboard: true } };
  }

  createMiniAppMessage(chatId, appUrl) {
    return { method: "sendMessage", chat_id: chatId, text: "Регистрация завершена. Запустите мини-приложение кнопкой ниже.",
      reply_markup: { keyboard: this.#createMainKeyboard(appUrl, false), resize_keyboard: true } };
  }

  createScoringGuideMessage(chatId) {
    return { method: "sendMessage", chat_id: chatId, text: this.scoringGuide.createMessageText(), parse_mode: "HTML" };
  }

  #createMainKeyboard(appUrl, includeContactRequest) {
    const rows = includeContactRequest ? [[{ text: "Поделиться номером", request_contact: true }]] : [];
    return [...rows, [{ text: "Открыть приложение", web_app: { url: appUrl } }], [{ text: "Как считаются очки" }]];
  }
}
