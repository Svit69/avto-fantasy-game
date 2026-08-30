export class RosterController {
  constructor({ bodyParser, jsonResponder, initDataVerifier, rosterRepository, priceLocker }) {
    Object.assign(this, { bodyParser, jsonResponder, initDataVerifier, rosterRepository, priceLocker });
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (!this.initDataVerifier.hasToken()) return this.jsonResponder.sendJson(response, 503, { error: "telegram_token_missing" });
    const payload = await this.bodyParser.readJson(request);
    const params = new URLSearchParams(payload.initData || "");
    if (!this.initDataVerifier.verifyInitData(params)) return this.jsonResponder.sendJson(response, 401, { error: "invalid_init_data" });
    const profile = JSON.parse(params.get("user") || "{}");
    const slots = await this.priceLocker.lockRosterSlotPrices(payload.slots || []);
    const roster = await this.rosterRepository.saveRoster(profile.id, slots);
    return this.jsonResponder.sendJson(response, 200, { ok: true, roster });
  }
}
