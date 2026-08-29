export class TelegramWebhookInstaller {
  constructor({ jsonResponder, botClient, webhookUrl, logger }) {
    this.jsonResponder = jsonResponder;
    this.botClient = botClient;
    this.webhookUrl = webhookUrl;
    this.logger = logger;
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.botClient.hasToken() || !this.webhookUrl) return this.jsonResponder.sendJson(response, 503, { error: "telegram_env_missing" });
    this.logger.info("telegram_set_webhook_requested", { webhookUrl: this.webhookUrl });
    try {
      const telegramResponse = await this.botClient.callMethod("setWebhook", { url: this.webhookUrl, drop_pending_updates: true });
      return this.jsonResponder.sendJson(response, telegramResponse.ok ? 200 : 502, await telegramResponse.json());
    } catch (error) {
      return this.jsonResponder.sendJson(response, 502, { error: "telegram_api_unreachable", ...this.botClient.createFailurePayload("setWebhook", error) });
    }
  }
}
