export class TelegramBotClient {
  constructor(token, logger) {
    this.token = token;
    this.logger = logger;
  }

  hasToken() { return Boolean(this.token); }

  async callMethod(method, payload) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);
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
      this.logger.warn("telegram_api_request_failed", { method, errorMessage: error.message });
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  async #logTelegramResponse(method, response) {
    const body = await response.clone().json().catch(() => ({}));
    const level = response.ok ? "info" : "warn";
    this.logger[level]("telegram_api_response", {
      method,
      status: response.status,
      ok: body.ok,
      errorCode: body.error_code,
      description: body.description,
    });
  }
}
