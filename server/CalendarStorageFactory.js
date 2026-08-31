import { CALENDAR_MATCHES, CALENDAR_TOURS } from "../src/data/calendarSeed.js";
import { OPPONENT_TEAMS } from "../src/data/opponentTeams.js";
import { FantasyCalendarRepository } from "./FantasyCalendarRepository.js";
import { OpponentTeamRepository } from "./OpponentTeamRepository.js";

export class CalendarStorageFactory {
  constructor(resolveStoragePath) {
    Object.assign(this, { resolveStoragePath });
  }

  createCalendarRepository() {
    return new FantasyCalendarRepository(this.resolveStoragePath(process.env.CALENDAR_DATABASE_PATH || "storage/calendar.json"), CALENDAR_TOURS, CALENDAR_MATCHES);
  }

  createOpponentTeamRepository() {
    return new OpponentTeamRepository(this.resolveStoragePath(process.env.OPPONENT_DATABASE_PATH || "storage/opponents.json"), OPPONENT_TEAMS);
  }
}
