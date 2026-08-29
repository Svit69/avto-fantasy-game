export class TelegramBotClient {
  constructor(token, logger, timeoutMs = 15000) {
    this.token = token;
    this.logger = logger;
    this.timeoutMs = timeoutMs;
  }

  hasToken() { return Boolean(this.token); }
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

  createFailurePayload(method, error) {
    return { method, errorName: error.name, errorMessage: error.message, causeCode: error.cause?.code, timeoutMs: this.timeoutMs };
  }
}
