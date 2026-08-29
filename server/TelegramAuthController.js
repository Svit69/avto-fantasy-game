export class TelegramAuthController {
  constructor({ bodyParser, jsonResponder, initDataVerifier, userMapper, userRepository }) {
    Object.assign(this, { bodyParser, jsonResponder, initDataVerifier, userMapper, userRepository });
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.initDataVerifier.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const params = new URLSearchParams(await this.bodyParser.readText(request));
    if (!this.initDataVerifier.verifyInitData(params)) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const profile = JSON.parse(params.get("user") || "{}");
    const user = await this.userRepository.upsertUser(this.userMapper.createUserFromTelegramProfile(profile));
    return this.jsonResponder.sendJson(response, 200, { managerName: user.name, monthlyPlace: "—" });
  }
}
