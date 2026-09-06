export class TelegramFallbackLinkController {
  constructor({ appUrl, userRepository, tokenService, view }) {
    Object.assign(this, { appUrl, userRepository, tokenService, view });
  }

  async createReply(update) {
    if (update.callback_query?.data === "fallback_site") return this.#createCallbackReply(update.callback_query);
    if (this.#isFallbackRequest(update.message?.text)) return this.#createMessageReply(update.message);
    return null;
  }

  async #createCallbackReply(callback) {
    await this.#answerCallback(callback.id);
    return this.#createLinkMessage(callback.message.chat.id, callback.from?.id);
  }

  #answerCallback(callbackId) {
    return this.view.answerCallback(callbackId);
  }

  #createMessageReply(message) {
    return this.#createLinkMessage(message.chat.id, message.from?.id);
  }

  async #createLinkMessage(chatId, userId) {
    const user = await this.userRepository.findUserById(userId);
    if (user?.status !== "active") return this.view.renderRegistrationRequired(chatId);
    const token = this.tokenService.createToken(user.id);
    return this.view.renderFallbackLink(chatId, this.#createWebLoginUrl(token));
  }

  #createWebLoginUrl(token) {
    const url = new URL(this.appUrl);
    url.searchParams.set("web_login", token);
    return url.toString();
  }

  #isFallbackRequest(text = "") {
    return text.trim().toLowerCase() === "не открывается приложение";
  }
}
