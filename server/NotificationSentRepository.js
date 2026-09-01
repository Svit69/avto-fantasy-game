import fs from "node:fs/promises";
import path from "node:path";

export class NotificationSentRepository {
  constructor(filePath) { this.filePath = filePath; }

  async hasNotificationBeenSent(userId, notificationKey) {
    const records = await this.#readRecords();
    return records.some((record) => record.userId === String(userId) && record.key === notificationKey);
  }

  async markNotificationAsSent(userId, notificationKey) {
    const records = await this.#readRecords();
    records.push({ userId: String(userId), key: notificationKey, sentAt: new Date().toISOString() });
    await this.#writeRecords(records);
  }

  async #readRecords() {
    try {
      const payload = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      return Array.isArray(payload.records) ? payload.records : [];
    } catch {
      return [];
    }
  }

  async #writeRecords(records) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify({ records }, null, 2), "utf8");
  }
}
