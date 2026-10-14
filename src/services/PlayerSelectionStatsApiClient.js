import { RequestAuthorizationHeaderFactory } from "./RequestAuthorizationHeaderFactory.js";
import { CapacityAwareApiRequest } from "./CapacityAwareApiRequest.js";

export class PlayerSelectionStatsApiClient {
  constructor(headerFactory = new RequestAuthorizationHeaderFactory()) { this.headerFactory = headerFactory; }

  async loadMonthlySelectionStats(month) {
    const response = await new CapacityAwareApiRequest().fetchResponse(`/api/player-selection-stats?month=${encodeURIComponent(month)}`, {
      headers: this.headerFactory.createAuthorizationHeaders(),
    });
    if (!response.ok) return { month, totalManagers: 0, players: {} };
    return (await response.json()).stats;
  }
}
