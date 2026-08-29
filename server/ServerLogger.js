export class ServerLogger {
  info(message, details = {}) {
    this.#writeLog("info", message, details);
  }

  warn(message, details = {}) {
    this.#writeLog("warn", message, details);
  }

  error(message, details = {}) {
    this.#writeLog("error", message, details);
  }

  #writeLog(level, message, details) {
    const payload = { level, time: new Date().toISOString(), ...details, message };
    console[level === "error" ? "error" : "log"](JSON.stringify(payload));
  }
}
