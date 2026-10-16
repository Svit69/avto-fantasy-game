import { ImportedMatchCalendarMatcher } from "./ImportedMatchCalendarMatcher.js";
export class TourResultReadinessPolicy {
  constructor(matcher = new ImportedMatchCalendarMatcher()) { this.matcher = matcher; }
  evaluateReadiness(tour, calendar, database, now) {
    const matches = (calendar.matches || []).filter((match) => match.tourId === tour.id && !["cancelled", "canceled"].includes(match.status));
    const missing = matches.filter((scheduled) => {
      if (!Number.isFinite(Date.parse(scheduled.startsAt)) || Date.parse(scheduled.startsAt) > now) return true;
      const imported = database.matches.find((match) => this.matcher.findCalendarMatch(match, [scheduled]));
      return !imported || imported.status !== "finished" || !database.playerStats.some((stat) => stat.matchId === imported.id);
    });
    return { complete: Number.isFinite(Date.parse(tour.endsAt)) && Date.parse(tour.endsAt) <= now && matches.length > 0 && !missing.length,
      missing: missing.map((match) => ({ id: match.id, homeTeam: match.homeTeam, awayTeam: match.awayTeam })) };
  }
}
