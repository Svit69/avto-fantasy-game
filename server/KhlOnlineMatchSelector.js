export class KhlOnlineMatchSelector {
  constructor(preparationMs = 600000, retryWindowMs = 172800000) { Object.assign(this, { preparationMs, retryWindowMs }); }
  findDueMatches(calendar, states, now = Date.now()) {
    return (calendar.matches || []).filter((match) => match.league === "КХЛ" && match.khlGameId
      && [match.homeTeam, match.awayTeam].includes("Автомобилист") && match.status !== "cancelled"
      && !states[match.id]?.completedAt && Date.parse(match.startsAt) - this.preparationMs <= now
      && Date.parse(match.startsAt) + this.retryWindowMs >= now
      && (!states[match.id]?.nextPollAt || states[match.id].nextPollAt <= now))
      .sort((first, second) => Date.parse(first.startsAt) - Date.parse(second.startsAt));
  }
}
