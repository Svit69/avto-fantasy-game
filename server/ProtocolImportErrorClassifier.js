export class ProtocolImportErrorClassifier {
  classifyError(error) {
    const message = String(error?.message || "");
    if (message.includes("telegram_file")) return this.#createError("telegram_file", "Telegram не отдал файл протокола.");
    if (message.includes("pdf")) return this.#createError("pdf_parse", "PDF не удалось разобрать.");
    if (message.includes("DATABASE") || message.includes("violates") || error?.code) return this.#createError("database", "Ошибка записи результата в базу данных.");
    if (error?.name === "AbortError") return this.#createError("telegram_timeout", "Telegram API не ответил вовремя.");
    return this.#createError("unknown", message || "Неизвестная ошибка обработки.");
  }

  #createError(code, description) {
    return { code, description };
  }
}
