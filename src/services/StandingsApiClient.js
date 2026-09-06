import { RequestAuthorizationHeaderFactory } from "./RequestAuthorizationHeaderFactory.js";

export class StandingsApiClient {
  constructor(headerFactory = new RequestAuthorizationHeaderFactory()) { this.headerFactory = headerFactory; }

  async loadMonthlyStandings(month) {
    const response = await fetch(`/api/standings?month=${encodeURIComponent(month)}`, {
      headers: this.headerFactory.createAuthorizationHeaders(),
    });
    if (!response.ok) throw new Error("standings_load_failed");
    return (await response.json()).standings;
  }
}
