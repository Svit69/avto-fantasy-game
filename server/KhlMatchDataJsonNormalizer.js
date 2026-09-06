import crypto from "node:crypto";
import { KhlMatchCollectionDeduplicator } from "./KhlMatchCollectionDeduplicator.js";

export class KhlMatchDataJsonNormalizer {
  constructor(deduplicator = new KhlMatchCollectionDeduplicator()) {
    this.deduplicator = deduplicator;
  }

  normalizeDatabase(database) {
    const normalized = this.#createEmptyDatabase(database);
    const matchIds = this.#createMatchIdMap(normalized.matches);
    normalized.events = normalized.events.map((event, index) => this.#normalizeMatchItem(event, index, matchIds, "event"));
    normalized.pointEntries = normalized.pointEntries.map((entry, index) => this.#normalizeMatchItem(entry, index, matchIds, "point"));
    normalized.playerStats = normalized.playerStats.map((stat) => this.#normalizePlayerStat(stat, matchIds));
    return { ...normalized, ...this.deduplicator.deduplicateCollections(normalized) };
  }

  #createEmptyDatabase(database) {
    return { matches: database.matches || [], events: database.events || [], pointEntries: database.pointEntries || [],
      playerStats: database.playerStats || [], runs: database.runs || [], snapshots: database.snapshots || [] };
  }

  #createMatchIdMap(matches) {
    return new Map(matches.map((match) => [String(match.gameId || ""), match.id]).filter(([gameId, id]) => gameId && id));
  }

  #normalizeMatchItem(item, index, matchIds, prefix) {
    const matchId = item.matchId || matchIds.get(String(item.gameId || "")) || this.#createFallbackMatchId(item);
    const id = item.id || item.eventId || item.eventKey || item.sourceHash || this.#createHashId(prefix, item, index);
    return { ...item, id: String(id), matchId };
  }

  #normalizePlayerStat(stat, matchIds) {
    return { ...stat, matchId: stat.matchId || matchIds.get(String(stat.gameId || "")) || this.#createFallbackMatchId(stat) };
  }

  #createFallbackMatchId(item) {
    if (!item.gameId) return "unknown-match";
    return `${String(item.tournamentId || "unknown")}-${String(item.gameId)}`;
  }

  #createHashId(prefix, item, index) {
    const hash = crypto.createHash("sha1").update(JSON.stringify(item)).digest("hex");
    return `${prefix}-${index}-${hash}`;
  }
}
