export class TelegramFallbackLinkView {
  constructor(botClient) {
    this.botClient = botClient;
  }

  renderFallbackLink(chatId, url) {
    return this.#message(chatId, "Если Mini App в Telegram не открывается, используйте запасной вход на сайт. Ссылка временная и уже привязана к вашей авторизации.", [[{ text: "Открыть сайт", url }]]);
  }

  renderRegistrationRequired(chatId) {
    return this.#message(chatId, "Сначала завершите регистрацию в боте: примите политику конфиденциальности и поделитесь номером телефона.");
  }

  answerCallback(callbackId) {
    return this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callbackId }).catch(() => {});
  }

  #message(chatId, text, inlineKeyboard) {
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: inlineKeyboard ? { inline_keyboard: inlineKeyboard } : undefined };
  }
}
