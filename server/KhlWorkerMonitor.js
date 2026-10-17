import { OperationalSettings } from "./OperationalSettings.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";

export class KhlWorkerMonitor {
  constructor(configuration = OnlineHockeyLeagueConfiguration.khl()) { this.configuration = configuration; }
  evaluateConditions(worker, now = Date.now()) {
    const { key, league } = this.configuration; const prefix = key.toUpperCase();
    const enabled = process.env[`MONITOR_${prefix}_ENABLED`] !== "false" && (worker || process.env[`MONITOR_${prefix}_ENABLED`] === "true");
    const limit = Math.max(1200000, OperationalSettings.readNumber(`${prefix}_ONLINE_POLL_INTERVAL_MS`, 300000, 300000) * 3 + 300000);
    const lastActivity = worker?.processing ? worker.startedAt : Math.max(worker?.completedAt || 0, worker?.failedAt || 0);
    return [{ key: `${key}_stale`, active: Boolean(enabled && (!lastActivity || now - lastActivity > limit)), holdMs: 60000,
      text: `Опрос ${league} давно не выполнялся. Проверьте процесс avto-${key}-online-poll.`, recoveryText: `${league}: фоновый процесс снова работает.` }];
  }
}
