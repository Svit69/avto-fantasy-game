export class AdminRouteParser {
  parseUpdate(update) {
    if (update.callback_query?.data?.startsWith("admin:")) return this.#parseCallback(update.callback_query);
    if (update.message?.text?.startsWith("/cancel")) return this.#parseMessage(update.message, { type: "cancel" });
    if (update.message?.text?.startsWith("/admin")) return this.#parseMessage(update.message, { type: "menu" });
    if (update.message?.text?.startsWith("/users")) return this.#parseMessage(update.message, { type: "users" });
    if (update.message?.text?.startsWith("/players")) return this.#parseMessage(update.message, { type: "players", page: 0 });
    return null;
  }

  #parseCallback(callback) {
    const parts = callback.data.split(":");
    const route = { type: parts[1], playerId: parts[2], page: Number(parts[2] || 0), value: parts.slice(3).join(":") };
    return { route, chatId: callback.message.chat.id, userId: callback.from?.id, callbackId: callback.id };
  }

  #parseMessage(message, route) {
    return { route, chatId: message.chat.id, userId: message.from?.id, text: message.text };
  }
}
