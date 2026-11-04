import { OnlineMatchScheduleRepository } from "./OnlineMatchScheduleRepository.js";
import { TourEffectiveDeadlineResolver } from "../src/services/TourEffectiveDeadlineResolver.js";

export class OnlineCalendarScheduleEnricher {
  constructor(repository = new OnlineMatchScheduleRepository()) { this.repository = repository; }
  async enrichCalendar(calendar) {
    const observations = await this.repository.listObservations();
    const matches = calendar.matches.map((match) => {
      const relevant = observations.filter((item) => item.id === match.id && item.tourId === match.tourId && item.league === match.league
        && item.homeTeam === match.homeTeam && item.awayTeam === match.awayTeam
        && item.scheduledAt?.slice(0, 10) === match.startsAt?.slice(0, 10));
      if (!relevant.length) return match;
      const record = relevant.find((item) => item.gameId === String(match[item.gameIdField]));
      const starts = relevant.map((item) => item.startedAt).filter((value) => Number.isFinite(value));
      const deadline = Math.min(...relevant.map((item) => item.deadlineAt));
      return { ...match, startsAt: record?.scheduledAt || match.startsAt, status: record?.status || match.status,
        observedDeadlineAt: new Date(deadline).toISOString(), observedStartedAt: starts.length ? new Date(Math.min(...starts)).toISOString() : null };
    });
    const enriched = { ...calendar, matches };
    return { ...enriched, tours: new TourEffectiveDeadlineResolver().resolveTours(enriched) };
  }
}
