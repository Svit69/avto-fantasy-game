export class TelegramBotClient {
  constructor(token, logger) {
    this.token = token;
    this.logger = logger;
  }

  hasToken() {
    return Boolean(this.token);
  }

  async callMethod(method, payload) {
    const response = await fetch(`https://api.telegram.org/bot${this.token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    await this.#logTelegramResponse(method, response);
    return response;
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
