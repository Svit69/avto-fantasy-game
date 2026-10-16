export class VhlWorkerAlertCondition {
  createCondition(worker) {
    const hasErrors = (worker?.failedMatches || 0) > 0 || Boolean(worker?.failedAt);
    const hasCounter = Number.isFinite(worker?.consecutiveFailedCycles);
    return { key: "vhl_errors",
      active: process.env.MONITOR_VHL_ENABLED !== "false" && hasErrors && (!hasCounter || worker.consecutiveFailedCycles >= 3),
      holdMs: hasCounter ? 0 : 300000,
      text: `ВХЛ: ${hasCounter ? `ошибки в ${worker.consecutiveFailedCycles} циклах опроса подряд` : "ошибки опроса сохраняются более пяти минут"}.\n${this.#describeFailure(worker)}\nПроверьте логи воркера.`,
      recoveryText: "ВХЛ: опрос снова проходит без ошибок." };
  }
  #describeFailure(worker) {
    const reason = String(worker?.error || worker?.lastFailures?.[0]?.reason || "");
    if (/timeout exceeded when trying to connect|connection timeout|ECONNREFUSED/i.test(reason)) return "Последняя причина: не удалось получить соединение с базой или внешним сервисом.";
    if (/vhl_.*http_5\d\d/.test(reason)) return "Последняя причина: сервер ВХЛ вернул ошибку 5xx.";
    if (/vhl_online_game_not_found|vhl_.*http_404/.test(reason)) return "Последняя причина: страница протокола ВХЛ недоступна.";
    if (/vhl_match_identity_mismatch/.test(reason)) return "Последняя причина: протокол не соответствует ожидаемому матчу.";
    return "Подробная причина записана в логах воркера.";
  }
}
