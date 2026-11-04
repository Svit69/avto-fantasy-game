import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";

export class RosterDeadlineAuditService {
  constructor(calendarRepository, rosterRepository) { Object.assign(this, { calendarRepository, rosterRepository }); }
  async createAuditReport(month) {
    const calendar = await this.calendarRepository.listCalendar();
    const tour = new TourSchedulePolicy().findTourAccessState(calendar, month);
    if (!tour.id || !Number.isFinite(tour.deadlineTime)) throw Error("audit_tour_not_found");
    const rosters = await this.rosterRepository.listRostersByMonth(month);
    const summary = (roster) => ({ userId: roster.userId, updatedAt: roster.updated_at || null, status: roster.status || "confirmed" });
    return { readOnlyRosters: true, month, tourId: tour.id, deadlineAt: new Date(tour.deadlineTime).toISOString(),
      potentiallyLateRosters: rosters.filter((roster) => Date.parse(roster.updated_at) >= tour.deadlineTime).map(summary),
      unverifiableRosters: rosters.filter((roster) => !Number.isFinite(Date.parse(roster.updated_at))).map(summary),
      note: "Последнее сохранение после дедлайна требует проверки. Предыдущая версия состава не восстанавливается из одной текущей записи." };
  }
}
