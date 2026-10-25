import { FantasyScoringGuideText } from "./FantasyScoringGuideText.js";
import { TelegramRegistrationText } from "./TelegramRegistrationText.js";

export class TelegramWebhookReplyFactory {
  constructor(scoringGuide = new FantasyScoringGuideText(), registrationText = new TelegramRegistrationText()) {
    Object.assign(this, { scoringGuide, registrationText });
  }

  createAgreementMessage(chatId) {
    const text = "Перед регистрацией ознакомьтесь с <a href=\"https://s-promo.ru/politika-konfidenczialnosti/\">Политикой конфиденциальности</a>.";
    return { method: "sendMessage", chat_id: chatId, text, parse_mode: "HTML",
      reply_markup: { inline_keyboard: [[{ text: "Принимаю", callback_data: "accept_privacy" }]] } };
  }

  createContactRequestMessage(chatId, appUrl) {
    return { method: "sendMessage", chat_id: chatId, text: this.registrationText.createContactRequestText(), parse_mode: "HTML",
      reply_markup: this.#createPersistentKeyboard(appUrl, true) };
  }

  createMiniAppMessage(chatId, appUrl) {
    return { method: "sendMessage", chat_id: chatId, text: "Регистрация завершена. Кнопки ниже останутся под рукой.",
      reply_markup: this.#createPersistentKeyboard(appUrl, false) };
  }

  createScoringGuideMessage(chatId) {
    return { method: "sendMessage", chat_id: chatId, text: this.scoringGuide.createMessageText(), parse_mode: "HTML" };
  }

  #createMainKeyboard(appUrl, includeContactRequest) {
    const rows = includeContactRequest ? [[{ text: "Поделиться номером", request_contact: true }]] : [];
    return [...rows, [{ text: "Открыть приложение", web_app: { url: appUrl } }, { text: "Как считаются очки" }],
      [{ text: "Обратная связь" }, { text: "Не открывается приложение" }]];
  }

  #createPersistentKeyboard(appUrl, includeContactRequest) {
    return { keyboard: this.#createMainKeyboard(appUrl, includeContactRequest),
      resize_keyboard: true, is_persistent: true, one_time_keyboard: false };
  }
}
