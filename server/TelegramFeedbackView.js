export class TelegramFeedbackView {
  createApiPayload(message) {
    const { method, ...payload } = message;
    return payload;
  }
  renderUserPrompt(chatId) {
    return this.#message(chatId, "Напишите сообщение для администрации одним текстом. Если передумали, нажмите «Отменить».", this.#cancelKeyboard());
  }

  renderCancelled(chatId) {
    return this.#message(chatId, "Обращение отменено.");
  }

  renderNoAdmins(chatId) {
    return this.#message(chatId, "Сейчас не настроены получатели обратной связи. Попробуйте позже.");
  }

  renderDelivered(chatId) {
    return this.#message(chatId, "Сообщение отправлено администрации. Ответ придёт сюда, в Telegram.");
  }

  renderAdminNotification(chatId, feedback) {
    const text = `Новое обращение\n\nМенеджер: ${feedback.name}\nTelegram ID: ${feedback.userId}\n\n${feedback.text}`;
    return this.#message(chatId, text, [[{ text: "Ответить", callback_data: `feedback:reply:${feedback.chatId}` }]]);
  }

  renderAdminReplyPrompt(chatId) {
    return this.#message(chatId, "Напишите ответ пользователю одним сообщением.", [[{ text: "Отменить ответ", callback_data: "feedback:cancel" }]]);
  }

  renderAdminAccessDenied(chatId) {
    return this.#message(chatId, "Ответить на обращение может только администратор.");
  }

  renderAdminReplySent(chatId) {
    return this.#message(chatId, "Ответ отправлен пользователю.");
  }

  renderUserReply(chatId, text) {
    return this.#message(chatId, `Ответ администрации:\n\n${text}`);
  }

  #cancelKeyboard() {
    return [[{ text: "Отменить", callback_data: "feedback:cancel" }]];
  }

  #message(chatId, text, inlineKeyboard) {
    return { method: "sendMessage", chat_id: chatId, text, reply_markup: inlineKeyboard ? { inline_keyboard: inlineKeyboard } : undefined };
  }
}
