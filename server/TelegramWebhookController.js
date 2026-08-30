export class TelegramWebhookController {
  constructor({ bodyParser, jsonResponder, botClient, appUrl, userMapper, userRepository, logger, summarizer, replyFactory, adminPanel }) {
    Object.assign(this, { bodyParser, jsonResponder, botClient, appUrl, userMapper, userRepository, logger, summarizer, replyFactory, adminPanel });
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.botClient.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const update = await this.#readTelegramUpdate(request, response);
    if (!update) return;
    this.logger.info("telegram_webhook_received", this.summarizer.summarizeUpdate(update));
    const reply = await this.#createTelegramWebhookReply(update);
    return this.jsonResponder.sendJson(response, 200, reply || { ok: true });
  }
  async #readTelegramUpdate(request, response) {
    try { return await this.bodyParser.readJson(request); } catch (error) {
      this.logger.warn("telegram_webhook_invalid_json", { errorMessage: error.message });
      this.jsonResponder.sendJson(response, 400, { error: "invalid_json" }); return null;
    }
  }
  async #createTelegramWebhookReply(update) {
    const adminReply = await this.adminPanel.createReply(update);
    if (adminReply) return adminReply;
    if (update.callback_query) return this.#acceptAgreement(update.callback_query);
    if (update.message?.contact) return this.#completeRegistration(update.message);
    if (this.#isStartCommand(update.message?.text)) return this.#sendAgreement(update.message.chat.id);
    this.logger.info("telegram_update_ignored", this.summarizer.summarizeUpdate(update));
    return null;
  }
  #isStartCommand(text = "") { return /^\/start(?:@\w+)?(?:\s|$)/.test(text.trim()); }
  async #completeRegistration(message) {
    this.logger.info("telegram_registration_contact_received", { chatId: message.chat.id, userId: message.from?.id });
    await this.userRepository.upsertUser(this.userMapper.createUserFromTelegramMessage(message));
    return this.replyFactory.createMiniAppMessage(message.chat.id, this.appUrl);
  }
  #acceptAgreement(callback) {
    this.logger.info("telegram_terms_accepted", { chatId: callback.message?.chat?.id, userId: callback.from?.id });
    this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callback.id }).catch((error) => {
      this.logger.warn("telegram_answer_callback_failed", { errorMessage: error.message });
    });
    return this.replyFactory.createContactRequestMessage(callback.message.chat.id);
  }
  #sendAgreement(chatId) {
    this.logger.info("telegram_send_agreement", { chatId });
    return this.replyFactory.createAgreementMessage(chatId);
  }
}
