import { TelegramBotMessageClassifier } from "./TelegramBotMessageClassifier.js";

export class TelegramWebhookReplyRouter {
  constructor({ botClient, userMapper, userRepository, logger, summarizer, replyFactory, adminPanel, supportController, miniAppReplyService, messageClassifier = new TelegramBotMessageClassifier() }) {
    Object.assign(this, { botClient, userMapper, userRepository, logger, summarizer, replyFactory, adminPanel, supportController, miniAppReplyService, messageClassifier });
  }
  async createReply(update) {
    const supportReply = await this.supportController?.createReply(update);
    if (supportReply) return supportReply;
    const adminReply = await this.adminPanel.createReply(update);
    if (adminReply) return adminReply;
    if (update.callback_query) return this.#handleCallback(update.callback_query);
    if (update.message?.contact) return this.#completeRegistration(update.message);
    if (this.messageClassifier.isScoringGuideRequest(update.message?.text)) return this.replyFactory.createScoringGuideMessage(update.message.chat.id);
    if (this.messageClassifier.isStartCommand(update.message?.text)) return this.#sendStartMessage(update.message);
    this.logger.info("telegram_update_ignored", this.summarizer.summarizeUpdate(update));
    return null;
  }
  async #completeRegistration(message) {
    this.logger.info("telegram_registration_contact_received", { chatId: message.chat.id, userId: message.from?.id });
    const user = await this.userRepository.upsertUser(this.userMapper.createUserFromTelegramMessage(message));
    return this.miniAppReplyService.createMiniAppMessage(message.chat.id, user);
  }
  async #sendStartMessage(message) {
    const user = await this.userRepository.findUserById(message.from?.id);
    if (user?.status === "active") return this.miniAppReplyService.createMiniAppMessage(message.chat.id, user);
    return this.#sendAgreement(message.chat.id);
  }
  async #handleCallback(callback) {
    if (callback.data === "score_guide") return this.#sendCallbackScoringGuide(callback);
    return this.#acceptAgreement(callback);
  }
  #sendCallbackScoringGuide(callback) {
    this.#answerCallback(callback);
    return this.replyFactory.createScoringGuideMessage(callback.message.chat.id);
  }
  #acceptAgreement(callback) {
    this.logger.info("telegram_privacy_accepted", { chatId: callback.message?.chat?.id, userId: callback.from?.id });
    this.#answerCallback(callback);
    return this.replyFactory.createContactRequestMessage(callback.message.chat.id, this.miniAppReplyService.appUrl);
  }
  #answerCallback(callback) {
    this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callback.id }).catch((error) => this.logger.warn("telegram_answer_callback_failed", { errorMessage: error.message }));
  }

  #sendAgreement(chatId) { this.logger.info("telegram_send_agreement", { chatId }); return this.replyFactory.createAgreementMessage(chatId); }
}
