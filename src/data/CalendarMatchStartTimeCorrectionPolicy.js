export class CalendarMatchStartTimeCorrectionPolicy {
  #corrections = [
    { id: "match-2027-01-29-gornyak-dynamo-altai", league: "ВХЛ", featuredTeam: "Горняк-УГМК",
      homeTeam: "Динамо-Алтай", awayTeam: "Горняк-УГМК",
      previousStartsAt: "2027-01-29T13:00:00+03:00", startsAt: "2027-01-29T15:00:00+03:00" },
    { id: "match-2026-11-23-gornyak-kristall", league: "ВХЛ", featuredTeam: "Горняк-УГМК",
      homeTeam: "Горняк-УГМК", awayTeam: "Кристалл",
      previousStartsAt: "2026-11-23T17:30:00+03:00", startsAt: "2026-11-23T16:30:00+03:00" },
    { id: "match-2026-11-04-avto-stalnye-lisy", league: "МХЛ", featuredTeam: "МХК Авто",
      homeTeam: "Стальные Лисы", awayTeam: "МХК Авто",
      previousStartsAt: "2026-11-04T16:30:00+03:00", startsAt: "2026-11-04T11:00:00+03:00" }
  ];
  applyCorrection(match) {
    const correction = this.#corrections.find((item) => item.id === match.id);
    if (!correction) return match;
    const sameMatch = ["id", "league", "featuredTeam", "homeTeam", "awayTeam"].every((field) => match[field] === correction[field]);
    const hasPreviousStart = Date.parse(match.startsAt) === Date.parse(correction.previousStartsAt);
    return sameMatch && hasPreviousStart ? { ...match, startsAt: correction.startsAt } : match;
  }
}
