export class AdminConversationStateStore {
  constructor() {
    this.states = new Map();
  }

  waitForPrice(chatId, playerId) {
    this.states.set(String(chatId), { type: "price", playerId });
  }

  waitForTeam(chatId, playerId) {
    this.states.set(String(chatId), { type: "team", playerId });
  }

  waitForProtocol(chatId, league) {
    this.states.set(String(chatId), { type: "protocol", league });
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
