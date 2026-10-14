import { RuntimeStateStore } from "./RuntimeStateStore.js";

export class ExternalAvailabilityProbe {
  constructor({ url, botClient, logger, store = new RuntimeStateStore(), fetcher = fetch, clock = Date.now, adminIds = (process.env.TELEGRAM_ADMIN_IDS || "").split(",") }) {
    Object.assign(this, { url, botClient, logger, store, fetcher, clock, adminIds });
  }
  async probeAvailability() {
    if (!this.url) throw new Error("HEALTH_PROBE_URL is required");
    const state = await this.store.readState("external-health-probe.json") || { failures: 0, successes: 0, alerted: false, nextAlert: 0 };
    let ready = false;
    try { const response = await this.fetcher(this.url, { signal: AbortSignal.timeout(10000), cache: "no-store" }); ready = response.ok && (await response.json()).ok === true; }
    catch {}
    state.failures = ready ? 0 : state.failures + 1; state.successes = ready ? state.successes + 1 : 0;
    if (state.failures >= 3 && this.clock() >= state.nextAlert) {
      const sent = await this.#notify("Внешний монитор: приложение недоступно или не готово три проверки подряд. Проверьте VPS, PostgreSQL, DNS и сеть.");
      state.alerted ||= sent; state.nextAlert = this.clock() + (sent ? 900000 : 60000);
    }
    if (state.alerted && state.successes >= 2 && await this.#notify("Внешний монитор: доступность приложения восстановлена, две успешные проверки подряд.")) state.alerted = false;
    await this.store.writeState("external-health-probe.json", state);
    return { ok: ready, failures: state.failures };
  }
  async #notify(text) {
    this.logger.warn("external_availability_alert", { text });
    if (!this.botClient.hasToken()) return true;
    let delivered = true;
    for (const chatId of this.adminIds.map((id) => id.trim()).filter(Boolean)) {
      try { if (!(await this.botClient.callJson("sendMessage", { chat_id: chatId, text })).ok) delivered = false; }
      catch { delivered = false; }
    }
    return delivered;
  }
}
