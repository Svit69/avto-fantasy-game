import { performance } from "node:perf_hooks";

export class ApiWorkMetrics {
  #samples = [];
  measureRequest(request, response, pathname) {
    if (request.method !== "GET" || pathname.startsWith("/api/telegram-") || pathname.startsWith("/api/internal/")) return;
    const started = performance.now(); const end = response.end; let recorded = false;
    response.end = (...args) => {
      if (!recorded) { recorded = true; this.recordSample(performance.now() - started, response.statusCode); }
      return end.apply(response, args);
    };
  }
  recordSample(durationMs, statusCode, now = Date.now()) {
    this.#samples.push({ durationMs, statusCode, time: now });
    if (this.#samples.length > 1000) this.#samples.shift();
  }
  readSnapshot(now = Date.now()) {
    this.#samples = this.#samples.filter((sample) => now - sample.time < 300000);
    const durations = this.#samples.map((sample) => sample.durationMs).sort((first, second) => first - second);
    return { count: durations.length, serverWorkP95Ms: durations.length ? durations[Math.ceil(durations.length * 0.95) - 1] : 0,
      serverErrorRate: durations.length ? this.#samples.filter((sample) => sample.statusCode >= 500).length / durations.length : 0 };
  }
}
