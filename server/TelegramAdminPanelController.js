export class TelegramAdminPanelController {
  constructor({ accessPolicy, routeParser, routeHandler, stateStore, botClient, logger }) {
    Object.assign(this, { accessPolicy, routeParser, routeHandler, stateStore, botClient, logger });
  }

  async createReply(update) {
    const source = this.routeParser.parseUpdate(update) || this.#extractPendingMessage(update);
    if (!source) return null;
    if (!this.accessPolicy.canManageBot(source.userId)) return this.routeHandler.renderAccessDenied(source.chatId);
    if (source.callbackId) this.#answerCallback(source.callbackId);
    return source.pending ? this.routeHandler.handlePendingInput(source) : this.routeHandler.executeRoute(source);
  }

  #extractPendingMessage(update) {
    const message = update.message;
    if (!message?.text) return null;
    const pending = this.stateStore.consumeState(message.chat.id);
    return pending ? { pending, text: message.text, chatId: message.chat.id, userId: message.from?.id } : null;
  }

  #answerCallback(callbackId) {
    this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callbackId }).catch((error) => {
      this.logger.warn("telegram_admin_callback_failed", { errorMessage: error.message });
    });
  }
}
