export class PlayerCatalogApiClient {
  constructor(fallbackPlayers) {
    this.fallbackPlayers = fallbackPlayers;
  }

  async loadPlayerCatalog() {
    try {
      const response = await fetch(`/api/players?stamp=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) return this.fallbackPlayers;
      const payload = await response.json();
      return Array.isArray(payload.players) ? payload.players : this.fallbackPlayers;
    } catch {
      return this.fallbackPlayers;
    }
  }
}
