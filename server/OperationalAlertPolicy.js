import { OperationalSettings as Settings } from "./OperationalSettings.js";

export class OperationalAlertPolicy {
  evaluateConditions(sample, api, worker, uptimeMs) {
    const mib = 1048576; const slowLimit = Settings.readNumber("MONITOR_API_P95_WARN_MS", 0, 0);
    const workerLimit = Math.max(600000, Settings.readNumber("VHL_ONLINE_POLL_INTERVAL_MS", 120000) * 3);
    return [
      { key: "memory_critical", active: sample.availableMemoryBytes < Settings.readNumber("MONITOR_MEMORY_CRITICAL_MB", 50) * mib, holdMs: 30000, text: `Критически мало доступной памяти: ${(sample.availableMemoryBytes / mib).toFixed(0)} МБ.` },
      { key: "memory_low", active: sample.availableMemoryBytes < Settings.readNumber("MONITOR_MEMORY_WARN_MB", 100) * mib, holdMs: 180000, text: "Мало доступной памяти на VPS." },
      { key: "cpu", active: sample.cpuPercent !== null && sample.cpuPercent > 85, holdMs: 300000, text: "CPU выше 85% более пяти минут." },
      { key: "disk", active: sample.freeDiskPercent < 15, holdMs: 120000, text: "На диске осталось менее 15% свободного места." },
      { key: "swap", active: sample.swapPagesPerSecond > 100, holdMs: 120000, text: "Продолжается интенсивный обмен со swap." },
      { key: "event_loop", active: sample.eventLoopP95Ms > 200, holdMs: 180000, text: "Цикл Node.js длительно задерживается. Проверьте тяжёлые задачи." },
      { key: "api_errors", active: api.count >= 30 && api.serverErrorRate > 0.05, holdMs: 120000, text: "Более 5% обычных GET-запросов завершаются серверными ошибками." },
      { key: "api_slow", active: slowLimit > 0 && api.count >= 50 && api.serverWorkP95Ms > slowLimit, holdMs: 180000, text: "Замедлилась серверная обработка GET-запросов. Это предупреждение, без блокировки и перезапуска." },
      { key: "database", active: sample.databaseReady === false, holdMs: 30000, text: "PostgreSQL недоступен. Сохранение составов может не работать." },
      { key: "database_pool", active: sample.poolWaiting > 2, holdMs: 120000, text: "Запросы длительно ожидают соединения с PostgreSQL." },
      { key: "vhl_stale", active: process.env.MONITOR_VHL_ENABLED !== "false" && uptimeMs > workerLimit && (!worker?.completedAt || sample.time - worker.completedAt > workerLimit), holdMs: 30000, text: "Опрос ВХЛ давно не завершался. Проверьте фоновый процесс." },
      { key: "vhl_errors", active: (worker?.failedMatches || 0) > 0 || Boolean(worker?.failedAt), holdMs: 120000, text: "ВХЛ: есть ошибки сбора данных. Проверьте логи воркера." },
    ];
  }
}
