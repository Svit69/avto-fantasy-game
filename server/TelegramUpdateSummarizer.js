export class TelegramUpdateSummarizer {
  summarizeUpdate(update) {
    const message = update.message;
    const callback = update.callback_query;
    return {
      updateId: update.update_id,
      type: this.#selectUpdateType(update),
      chatId: message?.chat?.id || callback?.message?.chat?.id,
      userId: message?.from?.id || callback?.from?.id,
      text: this.#sanitizeText(message?.text),
      callbackData: callback?.data,
      hasContact: Boolean(message?.contact),
    };
  }

  #selectUpdateType(update) {
    if (update.callback_query) return "callback_query";
    if (update.message?.contact) return "contact_message";
    if (update.message) return "message";
    return "unknown";
  }

  #sanitizeText(text) {
    return text?.startsWith("/") ? text : undefined;
  }
}
