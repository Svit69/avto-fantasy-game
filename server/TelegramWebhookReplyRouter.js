export class TelegramWebhookReplyRouter {
  constructor({ appUrl, botClient, userMapper, userRepository, logger, summarizer, replyFactory, adminPanel }) {
    Object.assign(this, { appUrl, botClient, userMapper, userRepository, logger, summarizer, replyFactory, adminPanel });
  }
  async createReply(update) {
    const adminReply = await this.adminPanel.createReply(update);
    if (adminReply) return adminReply;
    if (update.callback_query) return this.#handleCallback(update.callback_query);
    if (update.message?.contact) return this.#completeRegistration(update.message);
    if (this.#isScoringGuideRequest(update.message?.text)) return this.replyFactory.createScoringGuideMessage(update.message.chat.id);
    if (this.#isStartCommand(update.message?.text)) return this.#sendStartMessage(update.message);
    this.logger.info("telegram_update_ignored", this.summarizer.summarizeUpdate(update));
    return null;
  }
  #isStartCommand(text = "") { return /^\/start(?:@\w+)?(?:\s|$)/.test(text.trim()); }
  #isScoringGuideRequest(text = "") { return text.trim().toLowerCase() === "как считаются очки"; }
  async #completeRegistration(message) {
    this.logger.info("telegram_registration_contact_received", { chatId: message.chat.id, userId: message.from?.id });
    await this.userRepository.upsertUser(this.userMapper.createUserFromTelegramMessage(message));
    return this.replyFactory.createMiniAppMessage(message.chat.id, this.appUrl);
  }
  async #handleCallback(callback) {
    if (callback.data === "score_guide") return this.#sendCallbackScoringGuide(callback);
    return this.#acceptAgreement(callback);
  }
  async #sendStartMessage(message) {
    const user = await this.userRepository.findUserById(message.from?.id);
    if (user?.status === "active") return this.replyFactory.createMiniAppMessage(message.chat.id, this.appUrl);
    return this.#sendAgreement(message.chat.id);
  }
  #sendCallbackScoringGuide(callback) {
    this.#answerCallback(callback);
    return this.replyFactory.createScoringGuideMessage(callback.message.chat.id);
  }
  #acceptAgreement(callback) {
    this.logger.info("telegram_terms_accepted", { chatId: callback.message?.chat?.id, userId: callback.from?.id });
    this.#answerCallback(callback);
    return this.replyFactory.createContactRequestMessage(callback.message.chat.id, this.appUrl);
  }
  #answerCallback(callback) {
    this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callback.id }).catch((error) => {
      this.logger.warn("telegram_answer_callback_failed", { errorMessage: error.message });
    });
  }
  #sendAgreement(chatId) { this.logger.info("telegram_send_agreement", { chatId }); return this.replyFactory.createAgreementMessage(chatId); }
}
