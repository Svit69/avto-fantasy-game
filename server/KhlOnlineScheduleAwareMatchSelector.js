import { KhlOnlineMatchSelector } from "./KhlOnlineMatchSelector.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";

export class KhlOnlineScheduleAwareMatchSelector extends KhlOnlineMatchSelector {
  constructor(configuration = OnlineHockeyLeagueConfiguration.khl(), lookaheadMs = 86400000) {
    super(600000, 172800000, configuration); this.lookaheadMs = lookaheadMs;
  }
  findDueMatches(calendar, states, now = Date.now()) {
    const due = super.findDueMatches(calendar, states, now);
    const selected = new Set(due.map((match) => match.id));
    const probes = (calendar.matches || []).filter((match) => !selected.has(match.id) && match.league === this.configuration.league
      && match[this.configuration.gameIdField] && [match.homeTeam, match.awayTeam].includes(this.configuration.teamName)
      && !["cancelled", "canceled"].includes(match.status) && !states[match.id]?.completedAt
      && Date.parse(match.startsAt) > now + this.preparationMs && Date.parse(match.startsAt) <= now + this.lookaheadMs
      && (!states[match.id]?.nextPollAt || states[match.id].nextPollAt <= now));
    return [...due, ...probes.map((match) => ({ ...match, isScheduleProbe: true }))];
  }
}
