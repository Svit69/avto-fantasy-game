import { TelegramFeedbackStateStore } from "./TelegramFeedbackStateStore.js";
import { TelegramFeedbackView } from "./TelegramFeedbackView.js";
export class TelegramFeedbackController {
  constructor({ botClient, logger, adminIds, userRepository }) {
    const ids = adminIds.map((id) => String(id).trim()).filter(Boolean);
    Object.assign(this, { botClient, logger, userRepository, adminIds: ids, adminIdSet: new Set(ids), stateStore: new TelegramFeedbackStateStore(), view: new TelegramFeedbackView() });
  }
  async createReply(update) {
    if (update.callback_query?.data?.startsWith("feedback:")) return this.#handleCallback(update.callback_query);
    if (this.#isFeedbackRequest(update.message?.text)) return this.#openUserFeedback(update.message);
    return update.message ? this.#handlePendingMessage(update.message) : null;
  }
  async #handleCallback(callback) {
    this.#answerCallback(callback.id);
    const [, action, chatId] = callback.data.split(":");
    return { start: () => this.#openUserFeedback({ ...callback.message, from: callback.from }), cancel: () => this.#cancelFeedback(callback.message.chat.id),
      reply: () => this.#openAdminReply(callback, chatId) }[action]?.() || null;
  }
  async #handlePendingMessage(message) {
    const state = this.stateStore.consumeState(message.chat.id);
    if (!state) return null;
    if (this.#isCancelRequest(message.text)) return this.view.renderCancelled(message.chat.id);
    if (state.type === "admin_reply") return this.#sendAdminReply(message, state.userChatId);
    return this.#sendFeedbackToAdmins(message, state);
  }
  async #sendFeedbackToAdmins(message, state) {
    if (!message.text?.trim()) return this.#keepWaitingForUserMessage(message, state);
    if (!this.adminIds.length) return this.view.renderNoAdmins(message.chat.id);
    const feedback = await this.#createFeedbackPayload(message, state);
    await Promise.all(this.adminIds.map((id) => this.botClient.callMethod("sendMessage", this.view.createApiPayload(this.view.renderAdminNotification(id, feedback)))));
    return this.view.renderDelivered(message.chat.id);
  }
  async #sendAdminReply(message, userChatId) {
    if (!message.text?.trim()) return this.#keepWaitingForAdminReply(message, userChatId);
    await this.botClient.callMethod("sendMessage", this.view.createApiPayload(this.view.renderUserReply(userChatId, message.text.trim())));
    return this.view.renderAdminReplySent(message.chat.id);
  }
  async #createFeedbackPayload(message, state) {
    const user = await this.userRepository.findUserById(state.userId || message.from?.id);
    return { chatId: message.chat.id, userId: state.userId || message.from?.id, name: user?.name || message.from?.first_name || "Менеджер", text: message.text.trim() };
  }
  #openUserFeedback(message) { this.stateStore.waitForUserMessage(message.chat.id, message.from?.id); return this.view.renderUserPrompt(message.chat.id); }
  #openAdminReply(callback, chatId) { if (!this.adminIdSet.has(String(callback.from?.id))) return this.view.renderAdminAccessDenied(callback.message.chat.id); this.stateStore.waitForAdminReply(callback.message.chat.id, chatId); return this.view.renderAdminReplyPrompt(callback.message.chat.id); }
  #cancelFeedback(chatId) { this.stateStore.clearState(chatId); return this.view.renderCancelled(chatId); }
  #keepWaitingForUserMessage(message, state) { this.stateStore.waitForUserMessage(message.chat.id, state.userId); return this.view.renderUserPrompt(message.chat.id); }
  #keepWaitingForAdminReply(message, userChatId) { this.stateStore.waitForAdminReply(message.chat.id, userChatId); return this.view.renderAdminReplyPrompt(message.chat.id); }
  #isFeedbackRequest(text = "") { return text.trim().toLowerCase() === "обратная связь"; }
  #isCancelRequest(text = "") { return /^\/cancel(?:@\w+)?$/i.test(text.trim()) || text.trim().toLowerCase() === "отменить"; }
  #answerCallback(callbackId) { this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callbackId }).catch((error) => this.logger.warn("telegram_feedback_callback_failed", { errorMessage: error.message })); }
}
