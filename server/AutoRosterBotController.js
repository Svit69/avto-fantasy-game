import { AutoRosterReplyView } from "./AutoRosterReplyView.js";
import { TelegramWebhookReplyFactory } from "./TelegramWebhookReplyFactory.js";

export class AutoRosterBotController {
  constructor({ service, botClient, logger, view = new AutoRosterReplyView() }) { Object.assign(this, { service, botClient, logger, view }); }
  async createReply(update) {
    const callback = update.callback_query; const message = callback?.message || update.message;
    const isCallback = callback?.data?.startsWith("roster_auto:");
    const isCommand = /^(?:Автозаполнение состава|\/autofill(?:@\w+)?)$/i.test(update.message?.text || "");
    if (!isCallback && !isCommand) return null;
    if (callback) void this.botClient.callMethod("answerCallbackQuery", { callback_query_id: callback.id }).catch((error) => this.logger.warn("autofill_callback_failed", { errorMessage: error.message }));
    const userId = callback?.from?.id || update.message?.from?.id;
    if (!message || message.chat?.type !== "private" || String(message.chat.id) !== String(userId)) return { ok: true };
    if (isCommand) return this.#createReminderOnlyReply(message.chat.id);
    const tourId = isCallback ? callback.data.slice("roster_auto:".length) : "next";
    if (!tourId || Buffer.byteLength(callback?.data || "") > 64) return this.view.createReply(message.chat.id, { type: "closed" });
    try { return this.view.createReply(message.chat.id, await this.service.fillRoster(userId, tourId)); }
    catch (error) {
      this.logger.warn("autofill_roster_failed", { userId, errorMessage: error.message });
      return this.view.createReply(message.chat.id, { type: "busy" });
    }
  }
  #createReminderOnlyReply(chatId) {
    const reply = new TelegramWebhookReplyFactory().createMiniAppMessage(chatId, process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000");
    return { ...reply, text: "Автозаполнение доступно по кнопке в напоминании за сутки до дедлайна, если состав на следующий тур ещё не сохранён. Меню обновлено. Собрать состав самостоятельно можно в приложении." };
  }
}
