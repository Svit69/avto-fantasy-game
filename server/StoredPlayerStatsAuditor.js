import { GoalkeeperFantasyPointsCalculator } from "../src/scoring/GoalkeeperFantasyPointsCalculator.js";
import { SkaterFantasyPointsCalculator } from "../src/scoring/SkaterFantasyPointsCalculator.js";
import { CalendarMatchDatabaseFilter } from "./CalendarMatchDatabaseFilter.js";
import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";
import { MatchImportIntegrityAuditor } from "./MatchImportIntegrityAuditor.js";

export class StoredPlayerStatsAuditor {
  constructor() {
    this.matcher = new ImportedMatchCalendarMatcher();
    this.skaterCalculator = new SkaterFantasyPointsCalculator();
    this.goalkeeperCalculator = new GoalkeeperFantasyPointsCalculator();
    this.protocolImportAuditor = new MatchImportIntegrityAuditor();
    this.databaseFilter = new CalendarMatchDatabaseFilter(this.matcher);
  }

  audit({ calendar, database, players, now = new Date() }) {
    const relevantDatabase = this.databaseFilter.filter(calendar.matches || [], database);
    return [...this.#findMissingImports(calendar.matches || [], database.matches || [], now),
      ...this.#findInvalidPlayerPoints(relevantDatabase, players), ...this.protocolImportAuditor.audit(relevantDatabase)];
  }

  #findMissingImports(calendarMatches, importedMatches, now) {
    return calendarMatches.filter((match) => this.#requiresImport(match, now))
      .filter((match) => !importedMatches.some((imported) => this.matcher.findCalendarMatch(imported, [match])))
      .map((match) => ({ type: "missing_match_import", matchId: match.id, protocolId: this.#getProtocolId(match) }));
  }

  #findInvalidPlayerPoints(database, players) {
    const matches = new Map((database.matches || []).map((match) => [match.id, match]));
    const playersById = new Map(players.map((player) => [player.id, player]));
    return (database.playerStats || []).flatMap((stat) => {
      const match = matches.get(stat.matchId); const player = playersById.get(stat.playerId);
      if (!match || !player) return [{ type: "orphan_player_stat", matchId: stat.matchId, playerId: stat.playerId }];
      const expected = this.#calculateFantasyPoints(match, player, stat);
      return expected === Number(stat.fantasyPoints) ? []
        : [{ type: "incorrect_fantasy_points", matchId: stat.matchId, playerId: stat.playerId, stored: stat.fantasyPoints, expected }];
    });
  }

  #calculateFantasyPoints(match, player, stats) {
    const input = { league: match.league, team: player.team, events: stats };
    return stats.position === "вратарь" ? this.goalkeeperCalculator.calculateMatchFantasyPoints(input)
      : this.skaterCalculator.calculateMatchFantasyPoints({ ...input, position: stats.position || player.position });
  }

  #requiresImport(match, now) { return Date.parse(match.startsAt) < now.getTime() && Boolean(this.#getProtocolId(match)); }
  #getProtocolId(match) { return match.khlGameId || match.mhlGameId || match.onlineProtocolId || null; }
}
