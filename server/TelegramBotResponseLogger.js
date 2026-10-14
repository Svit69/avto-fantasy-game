export class TelegramBotResponseLogger {
  constructor(logger) { this.logger = logger; }
  async logResponse(method, response) {
    const body = await response.clone().json().catch(() => ({}));
    this.logger[response.ok ? "info" : "warn"]("telegram_api_response", { method, status: response.status,
      ok: body.ok, errorCode: body.error_code, description: body.description });
  }
}
