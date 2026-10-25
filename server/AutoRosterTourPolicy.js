import { TourSchedulePolicy } from "../src/services/TourSchedulePolicy.js";

export class AutoRosterTourPolicy {
  findOpenTour(calendar, tourId = "next", now = Date.now()) {
    const tours = new TourSchedulePolicy().buildTourAccessStates(calendar, now);
    return tours.find((tour) => (tourId === "next" || tour.id === tourId) && tour.isOpen && !tour.isLocked
      && Number.isFinite(tour.deadlineTime) && tour.deadlineTime > now) || null;
  }
  findEligiblePlayers(players, calendar, tour) {
    const teams = new Set((calendar.matches || []).filter((match) => match.tourId === tour.id).map((match) => match.featuredTeam));
    return players.filter((player) => player.status !== "left_game" && teams.has(player.team)
      && ["нападающий", "защитник", "вратарь"].includes(player.position) && Number.isInteger(player.price) && player.price >= 0);
  }
  isRosterSaved(roster) {
    return (!roster?.status || roster.status === "confirmed") && roster?.slots?.length === 6 && roster.slots.every((slot) => Boolean(slot.playerId));
  }
}
