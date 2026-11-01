import { VhlOnlineAdminNotificationTextFactory } from "./VhlOnlineAdminNotificationTextFactory.js";
import { VhlMatchReviewMessageFactory } from "./VhlMatchReviewMessageFactory.js";

export class VhlOnlineAdminNotifier {
  constructor({ botClient, adminIds, notificationRepository, logger = null, textFactory = new VhlOnlineAdminNotificationTextFactory(), reviewMessages = new VhlMatchReviewMessageFactory() }) {
    Object.assign(this, { botClient, adminIds: adminIds.map(String).filter(Boolean), notificationRepository, logger, textFactory, reviewMessages });
  }

  async notifyMatchStarted(match) {
    if (!match.isLivePollingWindow) return;
    return this.#sendOnce(`vhl:${match.id}:start`, this.textFactory.createMatchStartedText(match));
  }

  async notifyInterimResultCollected(match, result) {
    if (!result.ok || result.match.status === "finished") return;
    return this.#sendOnce(`vhl:${match.id}:interim`, this.textFactory.createInterimResultText(result.match, result));
  }

  async notifyFinalDataCollected(match, result) {
    if (!result.ok || result.match.status !== "finished") return;
    return this.#sendOnce(`vhl:${match.id}:final`, this.textFactory.createFinalCollectionText(result.match, result));
  }

  async notifyProtocolMismatch(match, sourceMatch) {
    const message = await this.reviewMessages.createReviewMessage(match, sourceMatch, this.textFactory.createProtocolMismatchText(match, sourceMatch));
    await this.#sendOnce(`vhl:${match.id}:mismatch:${message.id || match.onlineGameId}`, message.text, message.reply_markup);
    return message;
  }

  async notifyProtocolUnavailable(match) {
    return this.#sendOnce(`vhl:${match.id}:unavailable:${match.onlineGameId}`, this.textFactory.createProtocolUnavailableText(match));
  }

  async #sendOnce(notificationKey, text, replyMarkup) {
    if (!this.botClient.hasToken() || !this.notificationRepository) return;
    await Promise.all(this.adminIds.map((adminId) => this.#sendToAdminOnce(adminId, notificationKey, text, replyMarkup)));
  }

  async #sendToAdminOnce(adminId, notificationKey, text, replyMarkup) {
    if (await this.notificationRepository.hasNotificationBeenSent(adminId, notificationKey)) return;
    try {
      await this.botClient.callMethod("sendMessage", { chat_id: adminId, text, reply_markup: replyMarkup });
      await this.notificationRepository.markNotificationAsSent(adminId, notificationKey);
    } catch (error) {
      this.logger?.warn("vhl_online_admin_notification_failed", { adminId, notificationKey, errorMessage: error.message });
    }
  }
}
