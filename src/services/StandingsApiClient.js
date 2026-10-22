import { RequestAuthorizationHeaderFactory } from "./RequestAuthorizationHeaderFactory.js";
import { CapacityAwareApiRequest } from "./CapacityAwareApiRequest.js";

export class StandingsApiClient {
  constructor(headerFactory = new RequestAuthorizationHeaderFactory()) { this.headerFactory = headerFactory; }

  async loadMonthlyStandings(month, summary = false, offset = 0, version = "") {
    const page = summary ? "&summary=1" : `&limit=50&offset=${offset}&version=${encodeURIComponent(version)}`;
    const response = await new CapacityAwareApiRequest().fetchResponse(`/api/standings?month=${encodeURIComponent(month)}${page}`, {
      headers: this.headerFactory.createAuthorizationHeaders(),
    });
    if (!response.ok) throw new Error("standings_load_failed");
    return (await response.json()).standings;
  }
}
