export class TelegramWebhookController {
  constructor({ bodyParser, jsonResponder, botClient, appUrl }) {
    this.bodyParser = bodyParser;
    this.jsonResponder = jsonResponder;
    this.botClient = botClient;
    this.appUrl = appUrl;
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.botClient.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const update = await this.bodyParser.readJson(request);
    await this.#processTelegramUpdate(update);
    return this.jsonResponder.sendJson(response, 200, { ok: true });
  }

  async #processTelegramUpdate(update) {
    if (update.callback_query) return this.#acceptAgreement(update.callback_query);
    if (update.message?.contact) return this.#sendMiniAppButton(update.message.chat.id);
    if (update.message?.text === "/start") return this.#sendAgreement(update.message.chat.id);
  }

  async #acceptAgreement(callback) {
    await this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callback.id });
    return this.#sendContactRequest(callback.message.chat.id);
  }

  #sendAgreement(chatId) {
    return this.botClient.callMethod("sendMessage", { chat_id: chatId, text: "Примите пользовательское соглашение.",
      reply_markup: { inline_keyboard: [[{ text: "Принимаю", callback_data: "accept_terms" }]] } });
  }

  #sendContactRequest(chatId) {
    return this.botClient.callMethod("sendMessage", { chat_id: chatId, text: "Поделитесь номером телефона для регистрации.",
      reply_markup: { keyboard: [[{ text: "Поделиться номером", request_contact: true }]], resize_keyboard: true } });
  }

  #sendMiniAppButton(chatId) {
    return this.botClient.callMethod("sendMessage", { chat_id: chatId, text: "Регистрация завершена. Откройте Авто Фэнтези.",
      reply_markup: { keyboard: [[{ text: "Открыть приложение", web_app: { url: this.appUrl } }]], resize_keyboard: true } });
  }
}
