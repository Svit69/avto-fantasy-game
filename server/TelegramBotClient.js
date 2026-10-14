import { TelegramFileDownloader } from "./TelegramFileDownloader.js";
import { TelegramBotResponseLogger } from "./TelegramBotResponseLogger.js";
export class TelegramBotClient {
  constructor(token, logger, timeoutMs = 15000) {
    this.token = token;
    this.logger = logger;
    this.timeoutMs = timeoutMs;
  }

  hasToken() { return Boolean(this.token); }
  async callJson(method, payload) {
    const response = await this.callMethod(method, payload);
    return response.json();
  }

  async downloadFile(filePath) {
    return new TelegramFileDownloader().downloadFile(this.token, filePath);
  }

  async callMethod(method, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      await this.#logTelegramResponse(method, response);
      return response;
    } catch (error) {
      this.logger.warn("telegram_api_request_failed", this.createFailurePayload(method, error));
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async #logTelegramResponse(method, response) {
    await new TelegramBotResponseLogger(this.logger).logResponse(method, response);
  }

  createFailurePayload(method, error) {
    return { method, errorName: error.name, errorMessage: error.message, causeCode: error.cause?.code, timeoutMs: this.timeoutMs };
  }
}
