import { OperationalSettings } from "./OperationalSettings.js";

export class KhlWorkerMonitor {
  evaluateConditions(worker, now = Date.now()) {
    const enabled = process.env.MONITOR_KHL_ENABLED !== "false" && (worker || process.env.MONITOR_KHL_ENABLED === "true");
    const limit = Math.max(1200000, OperationalSettings.readNumber("KHL_ONLINE_POLL_INTERVAL_MS", 300000, 300000) * 3 + 300000);
    const lastActivity = worker?.processing ? worker.startedAt : Math.max(worker?.completedAt || 0, worker?.failedAt || 0);
    return [{ key: "khl_stale", active: Boolean(enabled && (!lastActivity || now - lastActivity > limit)), holdMs: 60000,
      text: "Опрос КХЛ давно не выполнялся. Проверьте процесс avto-khl-online-poll.", recoveryText: "КХЛ: фоновый процесс снова работает." }];
  }
}
