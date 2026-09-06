import { RequestAuthorizationHeaderFactory } from "./RequestAuthorizationHeaderFactory.js";

export class PlayerSelectionStatsApiClient {
  constructor(headerFactory = new RequestAuthorizationHeaderFactory()) { this.headerFactory = headerFactory; }

  async loadMonthlySelectionStats(month) {
    const response = await fetch(`/api/player-selection-stats?month=${encodeURIComponent(month)}`, {
      headers: this.headerFactory.createAuthorizationHeaders(),
    });
    if (!response.ok) return { month, totalManagers: 0, players: {} };
    return (await response.json()).stats;
  }
}
