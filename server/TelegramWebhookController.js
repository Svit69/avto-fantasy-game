import { TelegramWebhookReplyRouter } from "./TelegramWebhookReplyRouter.js";

export class TelegramWebhookController {
  constructor(dependencies) {
    Object.assign(this, dependencies);
    this.replyRouter = dependencies.replyRouter ?? new TelegramWebhookReplyRouter(dependencies);
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.botClient.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const update = await this.#readTelegramUpdate(request, response);
    if (!update) return;
    this.logger.info("telegram_webhook_received", this.summarizer.summarizeUpdate(update));
    const reply = await this.replyRouter.createReply(update);
    return this.jsonResponder.sendJson(response, 200, reply || { ok: true });
  }

  async #readTelegramUpdate(request, response) {
    try {
      return await this.bodyParser.readJson(request);
    } catch (error) {
      this.logger.warn("telegram_webhook_invalid_json", { errorMessage: error.message });
      this.jsonResponder.sendJson(response, 400, { error: "invalid_json" });
      return null;
    }
  }
}
