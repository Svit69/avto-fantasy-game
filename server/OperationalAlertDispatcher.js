import { OperationalSettings as Settings } from "./OperationalSettings.js";

export class OperationalAlertDispatcher {
  #states = new Map();
  constructor(botClient, logger, adminIds = (process.env.TELEGRAM_ADMIN_IDS || "").split(",")) { Object.assign(this, { botClient, logger, adminIds }); }
  async dispatchAlerts(conditions, now = Date.now()) {
    for (const condition of conditions) {
      const state = this.#states.get(condition.key) || { since: now, sent: false, nextAttempt: 0 };
      if (!condition.active) {
        if (!state.sent) { this.#states.delete(condition.key); continue; }
        state.recoveredSince ??= now;
        if (now - state.recoveredSince < 60000 || now < (state.recoveryRetry || 0)) continue;
        if (await this.#deliver(`Восстановление avto-fantasy: ${condition.recoveryText || `${condition.key}. Показатель вернулся в норму.`}`)) this.#states.delete(condition.key);
        else state.recoveryRetry = now + 60000;
        continue;
      }
      this.#states.set(condition.key, state);
      state.recoveredSince = null;
      if (now - state.since < condition.holdMs || now < state.nextAttempt) continue;
      const delivered = await this.#deliver(`Мониторинг avto-fantasy\n${condition.text}`);
      state.sent ||= delivered;
      state.nextAttempt = now + (delivered ? Settings.readNumber("MONITOR_ALERT_COOLDOWN_MS", 900000) : 60000);
    }
  }
  async #deliver(text) {
    this.logger.warn("operations_alert", { text });
    if (!this.botClient.hasToken()) return true;
    let delivered = true;
    for (const chatId of this.adminIds.map((id) => id.trim()).filter(Boolean)) {
      try { const reply = await this.botClient.callJson("sendMessage", { chat_id: chatId, text }); if (!reply.ok) delivered = false; }
      catch (error) { delivered = false; this.logger.warn("operations_alert_delivery_failed", { errorMessage: error.message }); }
    }
    return delivered;
  }
}
