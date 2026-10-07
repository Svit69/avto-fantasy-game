import { VhlOnlineAdminNotificationTextFactory } from "./VhlOnlineAdminNotificationTextFactory.js";

export class VhlOnlineAdminNotifier {
  constructor({ botClient, adminIds, notificationRepository, logger = null, textFactory = new VhlOnlineAdminNotificationTextFactory() }) {
    Object.assign(this, { botClient, adminIds: adminIds.map(String).filter(Boolean), notificationRepository, logger, textFactory });
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
    return this.#sendOnce(`vhl:${match.id}:mismatch:${match.onlineGameId}`, this.textFactory.createProtocolMismatchText(match, sourceMatch));
  }

  async notifyProtocolUnavailable(match) {
    return this.#sendOnce(`vhl:${match.id}:unavailable:${match.onlineGameId}`, this.textFactory.createProtocolUnavailableText(match));
  }

  async #sendOnce(notificationKey, text) {
    if (!this.botClient.hasToken() || !this.notificationRepository) return;
    await Promise.all(this.adminIds.map((adminId) => this.#sendToAdminOnce(adminId, notificationKey, text)));
  }

  async #sendToAdminOnce(adminId, notificationKey, text) {
    if (await this.notificationRepository.hasNotificationBeenSent(adminId, notificationKey)) return;
    try {
      await this.botClient.callMethod("sendMessage", { chat_id: adminId, text });
      await this.notificationRepository.markNotificationAsSent(adminId, notificationKey);
    } catch (error) {
      this.logger?.warn("vhl_online_admin_notification_failed", { adminId, notificationKey, errorMessage: error.message });
    }
  }
}
