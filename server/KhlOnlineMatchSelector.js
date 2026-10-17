import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";
export class KhlOnlineMatchSelector {
  constructor(preparationMs = 600000, retryWindowMs = 172800000, configuration = OnlineHockeyLeagueConfiguration.khl()) { Object.assign(this, { preparationMs, retryWindowMs, configuration }); }
  findDueMatches(calendar, states, now = Date.now()) {
    return (calendar.matches || []).filter((match) => match.league === this.configuration.league && match[this.configuration.gameIdField]
      && [match.homeTeam, match.awayTeam].includes(this.configuration.teamName) && !["cancelled", "canceled"].includes(match.status)
      && !states[match.id]?.completedAt && Date.parse(match.startsAt) - this.preparationMs <= now
      && Date.parse(match.startsAt) + this.retryWindowMs >= now
      && (!states[match.id]?.nextPollAt || states[match.id].nextPollAt <= now))
      .sort((first, second) => Date.parse(first.startsAt) - Date.parse(second.startsAt));
  }
}
