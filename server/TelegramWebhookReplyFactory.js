export class TelegramWebhookReplyFactory {
  createAgreementMessage(chatId) {
    return { method: "sendMessage", chat_id: chatId, text: "Примите пользовательское соглашение.",
      reply_markup: { inline_keyboard: [[{ text: "Принимаю", callback_data: "accept_terms" }]] } };
  }

  createContactRequestMessage(chatId) {
    return { method: "sendMessage", chat_id: chatId, text: "Поделитесь номером телефона для регистрации.",
      reply_markup: { keyboard: [[{ text: "Поделиться номером", request_contact: true }]], resize_keyboard: true } };
  }

  createMiniAppMessage(chatId, appUrl) {
    return { method: "sendMessage", chat_id: chatId, text: "Регистрация завершена. Запустите мини-приложение кнопкой ниже.",
      reply_markup: { inline_keyboard: [[{ text: "Открыть Авто Фэнтези", web_app: { url: appUrl } }]] } };
  }
}
