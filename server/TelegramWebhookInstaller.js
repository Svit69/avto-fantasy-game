export class TelegramWebhookInstaller {
  constructor({ jsonResponder, botClient, webhookUrl }) {
    this.jsonResponder = jsonResponder;
    this.botClient = botClient;
    this.webhookUrl = webhookUrl;
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.botClient.hasToken() || !this.webhookUrl) return this.jsonResponder.sendJson(response, 503, { error: "telegram_env_missing" });
    const telegramResponse = await this.botClient.callMethod("setWebhook", { url: this.webhookUrl });
    return this.jsonResponder.sendJson(response, telegramResponse.ok ? 200 : 502, await telegramResponse.json());
  }
}
