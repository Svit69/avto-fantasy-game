import { TelegramWebhookReplyRouter } from "./TelegramWebhookReplyRouter.js";
import { SharedSecretVerifier } from "./SharedSecretVerifier.js";
import { TelegramUpdateGate } from "./TelegramUpdateGate.js";

export class TelegramWebhookController {
  constructor(dependencies) {
    Object.assign(this, dependencies);
    this.replyRouter = dependencies.replyRouter ?? new TelegramWebhookReplyRouter(dependencies);
    this.updateGate = dependencies.updateGate || new TelegramUpdateGate();
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (process.env.TELEGRAM_WEBHOOK_SECRET && !new SharedSecretVerifier().matches(request.headers["x-telegram-bot-api-secret-token"], process.env.TELEGRAM_WEBHOOK_SECRET)) return this.jsonResponder.sendJson(response, 403, { error: "invalid_webhook_secret" });
    if (!this.botClient.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const update = await this.#readTelegramUpdate(request, response);
    if (!update) return;
    this.logger.info("telegram_webhook_received", this.summarizer.summarizeUpdate(update));
    const reply = await this.updateGate.runUpdate(update, () => this.replyRouter.createReply(update));
    return this.jsonResponder.sendJson(response, 200, reply || { ok: true });
  }

  async #readTelegramUpdate(request, response) {
    try {
      return await this.bodyParser.readJson(request);
    } catch (error) {
      this.logger.warn("telegram_webhook_invalid_json", { errorMessage: error.message });
      if ([408, 413].includes(error.statusCode)) response.setHeader("Connection", "close");
      this.jsonResponder.sendJson(response, error.statusCode || 400, { error: error.statusCode ? error.message : "invalid_json" });
      return null;
    }
  }
}
