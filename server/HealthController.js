export class HealthController {
  constructor({ jsonResponder, botClient, webhookUrl }) {
    this.jsonResponder = jsonResponder;
    this.botClient = botClient;
    this.webhookUrl = webhookUrl;
  }

  handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    return this.jsonResponder.sendJson(response, 200, {
      ok: true,
      hasTelegramToken: this.botClient.hasToken(),
      hasWebhookUrl: Boolean(this.webhookUrl),
      time: new Date().toISOString(),
    });
  }
}
