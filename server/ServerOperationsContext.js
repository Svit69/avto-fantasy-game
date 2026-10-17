import { ApiWorkMetrics } from "./ApiWorkMetrics.js";
import { ServerResourceSampler } from "./ServerResourceSampler.js";
import { OperationalAlertPolicy } from "./OperationalAlertPolicy.js";
import { OperationalAlertDispatcher } from "./OperationalAlertDispatcher.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
import { PostgresDatabase } from "./PostgresDatabase.js";
import { SharedSecretVerifier } from "./SharedSecretVerifier.js";
import { DatabaseReadinessProbe } from "./DatabaseReadinessProbe.js";
import { OperationalSettings } from "./OperationalSettings.js";
import { MirrorWorkerMonitorReader } from "./MirrorWorkerMonitorReader.js";

export class ServerOperationsContext {
  constructor({ rootDirectory, logger, botClient, metrics = new ApiWorkMetrics() }) {
    Object.assign(this, { rootDirectory, logger, botClient, metrics, startedAt: Date.now(), store: new RuntimeStateStore(), snapshot: {} });
    this.alerts = new OperationalAlertDispatcher(botClient, logger);
    this.databaseProbe = new DatabaseReadinessProbe();
  }
  startMonitoring() {
    if (process.env.OPERATIONS_MONITOR_ENABLED === "false") return;
    this.sampler = new ServerResourceSampler(this.rootDirectory);
    this.logger.info("operations_monitor_started", { apiLatencyWarningMs: OperationalSettings.readNumber("MONITOR_API_P95_WARN_MS", 0, 0) });
    const tick = async () => {
      try {
        const resources = await this.sampler.readSample(); const api = this.metrics.readSnapshot();
        const worker = await this.store.readState("vhl-heartbeat.json").catch((error) => { this.logger.warn("vhl_heartbeat_read_failed", { errorMessage: error.message }); return null; });
        const { khlWorker, mhlWorker, conditions } = await new MirrorWorkerMonitorReader(this.store).readWorkers();
        const database = await this.databaseProbe.checkReadiness(); resources.databaseReady = database.ok;
        resources.poolWaiting = PostgresDatabase.readPoolStatus()?.waiting || 0;
        this.snapshot = { resources, api, worker, khlWorker, mhlWorker, database, pool: PostgresDatabase.readPoolStatus() };
        await this.alerts.dispatchAlerts([...new OperationalAlertPolicy().evaluateConditions(resources, api, worker, Date.now() - this.startedAt), ...conditions]);
      } catch (error) { this.logger.warn("operations_monitor_failed", { errorMessage: error.message }); }
      if (this.sampler) { this.timer = setTimeout(tick, 15000); this.timer.unref(); }
    };
    this.timer = setTimeout(tick, 15000); this.timer.unref();
  }
  stopMonitoring() { clearTimeout(this.timer); this.sampler?.close(); this.sampler = null; }
  async handleEndpoint(request, response, pathname) {
    if (request.method !== "GET") return this.#reply(response, 405, { error: "method_not_allowed" });
    if (pathname === "/api/operations") {
      const token = process.env.OPERATIONS_MONITOR_TOKEN;
      if (!token || !new SharedSecretVerifier().matches(request.headers.authorization, `Bearer ${token}`)) return this.#reply(response, 403, { error: "access_denied" });
      return this.#reply(response, 200, { ...this.snapshot, api: this.metrics.readSnapshot(), capacity: this.readCapacity?.() });
    }
    try {
      const result = await this.databaseProbe.checkReadiness();
      return this.#reply(response, result.ok ? 200 : 503, { ...result, time: new Date().toISOString() });
    } catch { return this.#reply(response, 503, { ok: false, database: "unavailable" }); }
  }
  #reply(response, statusCode, payload) { response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); response.end(JSON.stringify(payload)); }
}
