import { KhlPayloadDataProvider } from "./KhlPayloadDataProvider.js";

export class KhlManualImportController {
  constructor({ bodyParser, jsonResponder, serviceFactory, maxBytes = 1_000_000 }) {
    Object.assign(this, { bodyParser, jsonResponder, serviceFactory, maxBytes });
  }

  async handleRequest(request, response) {
    if (request.method !== "POST") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    if (process.env.KHL_MANUAL_IMPORT_ENABLED !== "true") return this.jsonResponder.sendJson(response, 404, { error: "not_found" });
    if (!this.#isAuthorized(request)) return this.jsonResponder.sendJson(response, 401, { error: "invalid_import_token" });
    if (Number(request.headers["content-length"] || 0) > this.maxBytes) return this.jsonResponder.sendJson(response, 413, { error: "payload_too_large" });
    const payload = await this.bodyParser.readJson(request);
    if (!payload.match?.tournamentId || !payload.match?.gameId) return this.jsonResponder.sendJson(response, 422, { error: "invalid_khl_payload" });
    const service = this.serviceFactory.createIngestionService(new KhlPayloadDataProvider(payload));
    return this.jsonResponder.sendJson(response, 200, await service.ingestMatch(payload.match.tournamentId, payload.match.gameId));
  }

  #isAuthorized(request) {
    return Boolean(process.env.KHL_MANUAL_IMPORT_TOKEN) && request.headers["x-khl-import-token"] === process.env.KHL_MANUAL_IMPORT_TOKEN;
  }
}
