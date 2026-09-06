export class TelegramFeedbackStateStore {
  constructor() {
    this.states = new Map();
  }

  waitForUserMessage(chatId, userId) {
    this.states.set(String(chatId), { type: "user_message", userId });
  }

  waitForAdminReply(adminChatId, userChatId) {
    this.states.set(String(adminChatId), { type: "admin_reply", userChatId });
  }

  clearState(chatId) {
    this.states.delete(String(chatId));
  }

  consumeState(chatId) {
    const key = String(chatId);
    const state = this.states.get(key) || null;
    this.states.delete(key);
    return state;
  }
}
