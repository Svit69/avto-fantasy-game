import { FantasyScoringGuideText } from "./FantasyScoringGuideText.js";

export class TelegramWebhookReplyFactory {
  constructor(scoringGuide = new FantasyScoringGuideText()) { this.scoringGuide = scoringGuide; }

  createAgreementMessage(chatId) {
    const text = "Перед регистрацией ознакомьтесь с <a href=\"https://s-promo.ru/politika-konfidenczialnosti/\">Политикой конфиденциальности</a>.";
    return { method: "sendMessage", chat_id: chatId, text, parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "Принимаю", callback_data: "accept_privacy" }]] } };
  }

  createContactRequestMessage(chatId, appUrl) {
    return { method: "sendMessage", chat_id: chatId, text: "Поделитесь номером телефона для регистрации.",
      reply_markup: { keyboard: this.#createMainKeyboard(appUrl, true), resize_keyboard: true, one_time_keyboard: true } };
  }

  createMiniAppMessage(chatId, appUrl) {
    return { method: "sendMessage", chat_id: chatId, text: "Регистрация завершена. Запустите мини-приложение кнопкой ниже.",
      reply_markup: { inline_keyboard: this.#createRegisteredInlineKeyboard(appUrl) } };
  }

  createScoringGuideMessage(chatId) {
    return { method: "sendMessage", chat_id: chatId, text: this.scoringGuide.createMessageText(), parse_mode: "HTML" };
  }

  #createMainKeyboard(appUrl, includeContactRequest) {
    const rows = includeContactRequest ? [[{ text: "Поделиться номером", request_contact: true }]] : [];
    return [...rows, [{ text: "Открыть приложение", web_app: { url: appUrl } }], [{ text: "Как считаются очки" }]];
  }

  #createRegisteredInlineKeyboard(appUrl) {
    return [[{ text: "Открыть приложение", web_app: { url: appUrl } }],
      [{ text: "Как считаются очки", callback_data: "score_guide" }]];
  }
}
