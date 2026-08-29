export class TelegramAuthController {
  constructor({ bodyParser, jsonResponder, initDataVerifier }) {
    this.bodyParser = bodyParser;
    this.jsonResponder = jsonResponder;
    this.initDataVerifier = initDataVerifier;
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.initDataVerifier.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const params = new URLSearchParams(await this.bodyParser.readText(request));
    if (!this.initDataVerifier.verifyInitData(params)) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const user = JSON.parse(params.get("user") || "{}");
    return this.jsonResponder.sendJson(response, 200, { managerName: this.#createManagerName(user), monthlyPlace: "—" });
  }

  #createManagerName(user) {
    return [user.first_name, user.last_name].filter(Boolean).join(" ") || user.username || "Менеджер";
  }
}
