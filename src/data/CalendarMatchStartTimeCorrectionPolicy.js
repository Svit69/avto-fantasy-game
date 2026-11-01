export class CalendarMatchStartTimeCorrectionPolicy {
  #correction = {
    id: "match-2027-01-29-gornyak-dynamo-altai", league: "ВХЛ", featuredTeam: "Горняк-УГМК",
    homeTeam: "Динамо-Алтай", awayTeam: "Горняк-УГМК",
    previousStartsAt: "2027-01-29T13:00:00+03:00", startsAt: "2027-01-29T15:00:00+03:00"
  };
  applyCorrection(match) {
    const correction = this.#correction;
    const sameMatch = ["id", "league", "featuredTeam", "homeTeam", "awayTeam"].every((field) => match[field] === correction[field]);
    const hasPreviousStart = Date.parse(match.startsAt) === Date.parse(correction.previousStartsAt);
    return sameMatch && hasPreviousStart ? { ...match, startsAt: correction.startsAt } : match;
  }
}
