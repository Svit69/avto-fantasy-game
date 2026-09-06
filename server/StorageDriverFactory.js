import { INITIAL_PLAYERS } from "../src/data/players.js";
import { OPPONENT_TEAMS } from "../src/data/opponentTeams.js";
import { CALENDAR_MATCHES, CALENDAR_TOURS } from "../src/data/calendarSeed.js";
import { FantasyCalendarRepository } from "./FantasyCalendarRepository.js";
import { KhlMatchDataRepository } from "./KhlMatchDataRepository.js";
import { OpponentTeamRepository } from "./OpponentTeamRepository.js";
import { PlayerCatalogRepository } from "./PlayerCatalogRepository.js";
import { PostgresCalendarRepository } from "./PostgresCalendarRepository.js";
import { PostgresDatabase } from "./PostgresDatabase.js";
import { PostgresKhlMatchDataRepository } from "./PostgresKhlMatchDataRepository.js";
import { PostgresNotificationSentRepository } from "./PostgresNotificationSentRepository.js";
import { PostgresOpponentTeamRepository } from "./PostgresOpponentTeamRepository.js";
import { PostgresPlayerCatalogRepository } from "./PostgresPlayerCatalogRepository.js";
import { PostgresRosterRepository } from "./PostgresRosterRepository.js";
import { PostgresUserRepository } from "./PostgresUserRepository.js";
import { RosterRepository } from "./RosterRepository.js";
import { TeamBrandResolver } from "./TeamBrandResolver.js";
import { UserRepository } from "./UserRepository.js";

export class StorageDriverFactory {
  constructor(resolveStoragePath, database = null) { Object.assign(this, { resolveStoragePath, database }); }
  isPostgresEnabled() { return process.env.STORAGE_DRIVER === "postgres"; }
  getDatabase() { return this.database ||= new PostgresDatabase(); }
  createUserRepository() { return this.isPostgresEnabled() ? new PostgresUserRepository(this.getDatabase()) : new UserRepository(this.resolveStoragePath(process.env.USER_DATABASE_PATH || "storage/users.json")); }
  createRosterRepository() { return this.isPostgresEnabled() ? new PostgresRosterRepository(this.getDatabase()) : new RosterRepository(this.resolveStoragePath(process.env.ROSTER_DATABASE_PATH || "storage/rosters.json")); }
  createMatchDataRepository() { return this.isPostgresEnabled() ? new PostgresKhlMatchDataRepository(this.getDatabase()) : new KhlMatchDataRepository(this.resolveStoragePath(process.env.KHL_DATABASE_PATH || "storage/khl-match-data.json")); }
  createNotificationSentRepository() { return this.isPostgresEnabled() ? new PostgresNotificationSentRepository(this.getDatabase()) : null; }

  createPlayerCatalogRepository() {
    const args = [INITIAL_PLAYERS, new TeamBrandResolver()];
    return this.isPostgresEnabled() ? new PostgresPlayerCatalogRepository(this.getDatabase(), ...args)
      : new PlayerCatalogRepository(this.resolveStoragePath(process.env.PLAYER_DATABASE_PATH || "storage/players.json"), ...args);
  }

  createCalendarRepository() {
    return this.isPostgresEnabled() ? new PostgresCalendarRepository(this.getDatabase(), CALENDAR_TOURS, CALENDAR_MATCHES)
      : new FantasyCalendarRepository(this.resolveStoragePath(process.env.CALENDAR_DATABASE_PATH || "storage/calendar.json"), CALENDAR_TOURS, CALENDAR_MATCHES);
  }

  createOpponentTeamRepository() {
    return this.isPostgresEnabled() ? new PostgresOpponentTeamRepository(this.getDatabase(), OPPONENT_TEAMS)
      : new OpponentTeamRepository(this.resolveStoragePath(process.env.OPPONENT_DATABASE_PATH || "storage/opponents.json"), OPPONENT_TEAMS);
  }
}
