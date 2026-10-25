import { createRosterPriceFixture } from "./roster-prices-test-fixture.js";
import { AutoRosterSubmissionService } from "./AutoRosterSubmissionService.js";

export async function createAutoRosterFixture() {
  const base = await createRosterPriceFixture(); const positions = ["нападающий", "нападающий", "нападающий", "защитник", "защитник", "вратарь"];
  const players = ["A", "B", "C"].flatMap((team, club) => positions.map((position, index) => ({ id: `${team}${index}`, firstName: "Player", lastName: `${team}${index}`,
    team, position, price: 8 + index + club, autoScore: index + club, status: "active" })));
  const calendar = { tours: base.calendar.tours.map((tour) => ({ ...tour, startsAt: tour.deadlineAt })), matches: [] };
  calendar.tours.find((tour) => tour.month === "next").deadlineAt = new Date(base.now + 86400000).toISOString();
  for (const tour of calendar.tours) for (const team of ["A", "B", "C"]) calendar.matches.push({ id: `${tour.id}-${team}`, tourId: tour.id,
    startsAt: tour.deadlineAt, homeTeam: team, awayTeam: "Opponent", featuredTeam: team });
  const users = [{ id: "1", status: "active" }, { id: "2", status: "active" }, { id: "3", status: "blocked" }, { id: "4", status: "pending" }];
  const options = { ...base, calendar, players, users, heavy: { runTask: (task) => task() },
    userRepository: { async findUserById(id) { return users.find((user) => user.id === String(id)) || null; } },
    calendarRepository: { async listCalendar() { return calendar; } }, playerCatalogRepository: { async listPlayers() { return players; } },
    matchDataRepository: { async readDatabase() { return { matches: [], playerStats: [] }; } } };
  return { ...options, service: new AutoRosterSubmissionService(options) };
}
