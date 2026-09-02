import { KhlEventNormalizer } from "./KhlEventNormalizer.js";
import { KhlFantasyEventMapper } from "./KhlFantasyEventMapper.js";
import { KhlFantasyPointValuePolicy } from "./KhlFantasyPointValuePolicy.js";
import { KhlPlayerResolver } from "./KhlPlayerResolver.js";
import { KhlPlayerStatsAggregator } from "./KhlPlayerStatsAggregator.js";

export class KhlMatchIngestionService {
  constructor({ dataProvider, repository, playerCatalogRepository, scopePolicy, normalizer = new KhlEventNormalizer(), mapper = new KhlFantasyEventMapper(), pointValuePolicy = new KhlFantasyPointValuePolicy(), aggregator = new KhlPlayerStatsAggregator() }) {
    Object.assign(this, { dataProvider, repository, playerCatalogRepository, scopePolicy, normalizer, mapper, pointValuePolicy, aggregator });
  }

  async ingestMatch(tournamentId, gameId) {
    const sourceMatch = await this.dataProvider.getMatch(tournamentId, gameId);
    const match = this.#createMatchRecord(sourceMatch, tournamentId, gameId);
    if (!this.scopePolicy.canProcessMatch(match)) return { ok: false, reason: "match_out_of_scope", match };
    const [players, rawEvents] = await Promise.all([this.playerCatalogRepository.listPlayers(), this.dataProvider.getPlayByPlay(tournamentId, gameId)]);
    const events = this.normalizer.normalizeRawEvents(match, rawEvents);
    const pointEntries = this.#createPointEntries(match, events, new KhlPlayerResolver(players));
    const playersById = Object.fromEntries(players.map((player) => [player.id, player]));
    const playerStats = this.aggregator.createPlayerMatchStats(match, pointEntries, playersById);
    await this.repository.upsertMatch({ ...match, lastEventAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    await this.repository.replaceMatchCollections(match.id, { events, pointEntries, playerStats });
    return { ok: true, match, eventsReceived: events.length, pointEntriesCreated: pointEntries.length, playerStats };
  }

  #createPointEntries(match, events, resolver) {
    return events.flatMap((event) => this.mapper.createFantasyEvents(event).map((fantasyEvent) => {
      const player = resolver.findPlayerByKhlId(fantasyEvent.khlPlayerId);
      return player ? { id: `${fantasyEvent.eventId}:${fantasyEvent.eventType}:${player.id}`, matchId: match.id, playerId: player.id, eventId: fantasyEvent.eventId, eventType: fantasyEvent.eventType, points: this.pointValuePolicy.resolveEventPoints(player, fantasyEvent.eventType), status: "active", updatedAt: new Date().toISOString() } : null;
    }).filter(Boolean));
  }

  #createMatchRecord(match, tournamentId, gameId) {
    return { id: `${tournamentId}-${gameId}`, tournamentId: String(tournamentId), gameId: String(gameId), homeTeamId: String(match.homeTeamId || ""), awayTeamId: String(match.awayTeamId || ""), league: match.league || "КХЛ", status: match.status || "scheduled", scheduledAt: match.scheduledAt || null, createdAt: match.createdAt || new Date().toISOString() };
  }
}
