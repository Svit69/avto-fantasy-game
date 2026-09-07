export class ProtocolImportErrorClassifier {
  classifyError(error) {
    const message = String(error?.message || "");
    if (message.includes("telegram_file")) return this.#createError("telegram_file", "Telegram не отдал файл протокола.");
    if (message.includes("pdf")) return this.#createError("pdf_parse", "PDF не удалось разобрать.");
    if (message.includes("DATABASE") || message.includes("violates") || error?.code) return this.#createError("database", this.#createDatabaseErrorDescription(error));
    if (error?.name === "AbortError") return this.#createError("telegram_timeout", "Telegram API не ответил вовремя.");
    return this.#createError("unknown", message || "Неизвестная ошибка обработки.");
  }

  #createDatabaseErrorDescription(error) {
    const parts = ["Ошибка записи результата в базу данных."];
    if (error?.code) parts.push(`SQL-код: ${error.code}.`);
    if (error?.table) parts.push(`Таблица: ${error.table}.`);
    if (error?.column) parts.push(`Колонка: ${error.column}.`);
    if (error?.constraint) parts.push(`Ограничение: ${error.constraint}.`);
    if (error?.detail) parts.push(`Детали: ${error.detail}`);
    if (String(error?.message || "").startsWith("DATABASE_REQUIRED_VALUE_MISSING:")) parts.push(`Нет поля: ${String(error.message).split(":")[1]}.`);
    return parts.join("\n");
  }

  #createError(code, description) {
    return { code, description };
  }
}
