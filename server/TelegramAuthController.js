import { WebLoginTokenService } from "./WebLoginTokenService.js";

export class TelegramAuthController {
  constructor({ bodyParser, jsonResponder, initDataVerifier, userMapper, userRepository, webLoginTokenService = new WebLoginTokenService(process.env.TELEGRAM_BOT_TOKEN) }) {
    Object.assign(this, { bodyParser, jsonResponder, initDataVerifier, userMapper, userRepository, webLoginTokenService });
  }

  async handleRequest(request, response) {
    if (request.method === "GET") return this.#handleWebLoginRequest(request, response);
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.initDataVerifier.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const params = new URLSearchParams(await this.bodyParser.readText(request));
    if (!this.initDataVerifier.verifyInitData(params)) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const user = await this.#upsertTelegramUser(params);
    return this.#sendProfile(response, user, "telegram");
  }

  async #upsertTelegramUser(params) {
    const profile = JSON.parse(params.get("user") || "{}");
    return this.userRepository.upsertUser(this.userMapper.createUserFromTelegramProfile(profile));
  }

  async #handleWebLoginRequest(request, response) {
    const token = new URL(request.url, `http://${request.headers.host}`).searchParams.get("web_login");
    const payload = this.webLoginTokenService.verifyToken(token);
    const user = payload && await this.userRepository.findUserById(payload.userId);
    if (user?.status !== "active") return this.jsonResponder.sendJson(response, 401, { error: "invalid_web_login" });
    return this.#sendProfile(response, user, "web_login");
  }

  #sendProfile(response, user, nameSource) {
    return this.jsonResponder.sendJson(response, 200, { managerName: user.name, monthlyPlace: "—", userId: user.id, nameSource });
  }
}
