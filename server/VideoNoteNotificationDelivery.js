import fs from "node:fs/promises";
import crypto from "node:crypto";
import lockfile from "proper-lockfile";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
export class VideoNoteNotificationDelivery {
  constructor(botClient, logger, store = new RuntimeStateStore()) { Object.assign(this, { botClient, logger, store }); }
  #name(job) { return `video-delivery-${crypto.createHash("sha256").update(`${job.userId}:${job.key}`).digest("hex")}.json`; }
  async isDeliveryPending(job) {
    const receipt = await this.store.readState(this.#name(job));
    return !receipt || receipt.status === "rejected" && receipt.retryAt <= Date.now();
  }
  async deliver(job) {
    await fs.mkdir(this.store.directory, { recursive: true });
    let release;
    try { release = await lockfile.lock(this.store.resolveFile(this.#name(job)), { realpath: false, stale: 60000, update: 10000, retries: 0 }); }
    catch (error) { if (error.code === "ELOCKED") return "skipped"; throw error; }
    try {
      if (!await this.isDeliveryPending(job)) return "skipped";
      const receipt = { userId: String(job.userId), key: job.key, playerId: job.playerId, attemptedAt: new Date().toISOString() };
      await this.store.writeState(this.#name(job), { ...receipt, status: "attempting" });
      let result;
      try { result = await this.botClient.callJson("sendVideoNote", { chat_id: job.userId, video_note: job.videoNote }); }
      catch (error) {
        await this.store.writeState(this.#name(job), { ...receipt, status: "uncertain", error: error.message });
        this.logger.warn("player_video_delivery_uncertain", { userId: job.userId, key: job.key, errorMessage: error.message });
        return "failed";
      }
      if (!result.ok) {
        const retryable = result.error_code === 429 || result.error_code >= 500;
        await this.store.writeState(this.#name(job), { ...receipt, status: retryable ? "rejected" : "failed", errorCode: result.error_code,
          retryAt: Date.now() + Math.max(60000, Number(result.parameters?.retry_after || 60) * 1000) });
        this.logger.warn("player_video_delivery_rejected", { userId: job.userId, errorCode: result.error_code });
        return "failed";
      }
      await this.store.writeState(this.#name(job), { ...receipt, status: "sent", messageId: result.result?.message_id });
      this.logger.info("player_video_notification_sent", { userId: job.userId, playerId: job.playerId, key: job.key });
      return "sent";
    } finally { await release(); }
  }
}
