export class TelegramWebhookInfoController {
  constructor({ jsonResponder, botClient }) {
    this.jsonResponder = jsonResponder;
    this.botClient = botClient;
  }

  async handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.botClient.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    try {
      const telegramResponse = await this.botClient.callMethod("getWebhookInfo", {});
      return this.jsonResponder.sendJson(response, telegramResponse.ok ? 200 : 502, await telegramResponse.json());
    } catch (error) {
      return this.jsonResponder.sendJson(response, 502, { error: "telegram_api_unreachable", errorMessage: error.message });
    }
  }
}
