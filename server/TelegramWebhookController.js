export class TelegramWebhookController {
  constructor({ bodyParser, jsonResponder, botClient, appUrl, userMapper, userRepository, logger, summarizer }) {
    Object.assign(this, { bodyParser, jsonResponder, botClient, appUrl, userMapper, userRepository, logger, summarizer });
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.botClient.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const update = await this.bodyParser.readJson(request);
    this.logger.info("telegram_webhook_received", this.summarizer.summarizeUpdate(update));
    await this.#processTelegramUpdate(update);
    return this.jsonResponder.sendJson(response, 200, { ok: true });
  }

  async #processTelegramUpdate(update) {
    if (update.callback_query) return this.#acceptAgreement(update.callback_query);
    if (update.message?.contact) return this.#completeRegistration(update.message);
    if (this.#isStartCommand(update.message?.text)) return this.#sendAgreement(update.message.chat.id);
    this.logger.info("telegram_update_ignored", this.summarizer.summarizeUpdate(update));
  }
  #isStartCommand(text = "") { return /^\/start(?:@\w+)?(?:\s|$)/.test(text.trim()); }

  async #completeRegistration(message) {
    this.logger.info("telegram_registration_contact_received", { chatId: message.chat.id, userId: message.from?.id });
    await this.userRepository.upsertUser(this.userMapper.createUserFromTelegramMessage(message));
    return this.#sendMiniAppButton(message.chat.id);
  }

  async #acceptAgreement(callback) {
    this.logger.info("telegram_terms_accepted", { chatId: callback.message?.chat?.id, userId: callback.from?.id });
    await this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callback.id });
    return this.#sendContactRequest(callback.message.chat.id);
  }

  #sendAgreement(chatId) {
    this.logger.info("telegram_send_agreement", { chatId });
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
