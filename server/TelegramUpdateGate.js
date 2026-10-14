import fs from "node:fs/promises";
import path from "node:path";
import { BoundedTaskQueue } from "./BoundedTaskQueue.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { ServiceCapacityError } from "./ServiceCapacityError.js";

export class TelegramUpdateGate {
  #pending = new Map();
  #chats = new Map();
  #completed = 99;
  constructor(store = new RuntimeStateStore(path.join(new RuntimeStateStore().directory, "telegram-receipts"))) {
    this.store = store; this.queue = new BoundedTaskQueue(2, 8);
  }
  async runUpdate(update, task) {
    if (!Number.isSafeInteger(update.update_id) || update.update_id < 0) throw Object.assign(new Error("invalid_update_id"), { statusCode: 400 });
    const id = String(update.update_id);
    if (this.#pending.has(id)) return this.#pending.get(id);
    const status = this.queue.readStatus();
    if (status.active >= 2 && status.waiting >= 8) throw new ServiceCapacityError("telegram_queue_full");
    const chatId = String(update.message?.chat?.id || update.callback_query?.message?.chat?.id || id);
    const previous = this.#chats.get(chatId);
    const job = this.queue.runTask(async () => {
      await previous?.catch(() => {});
      const stored = await this.store.readState(`${id}.json`);
      if (stored) return stored.reply;
      const reply = await task();
      await this.store.writeState(`${id}.json`, { reply, completedAt: Date.now() });
      if (++this.#completed % 100 === 0) await this.#pruneReceipts();
      return reply;
    });
    this.#pending.set(id, job); this.#chats.set(chatId, job);
    try { return await job; } finally {
      this.#pending.delete(id); if (this.#chats.get(chatId) === job) this.#chats.delete(chatId);
    }
  }
  async #pruneReceipts() {
    const records = [];
    for (const name of await fs.readdir(this.store.directory)) if (/^\d+\.json$/.test(name)) {
      const file = this.store.resolveFile(name); const stat = await fs.stat(file).catch(() => null);
      if (stat) records.push({ file, time: stat.mtimeMs });
    }
    records.sort((first, second) => second.time - first.time);
    for (const [index, record] of records.entries()) if (index >= 2000 || Date.now() - record.time > 86400000) await fs.rm(record.file, { force: true });
  }
}
