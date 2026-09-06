import { RosterJsonNormalizer } from "./RosterJsonNormalizer.js";

export class JsonToPostgresImporter {
  constructor(storageFactory, jsonReader, rosterNormalizer = new RosterJsonNormalizer()) {
    Object.assign(this, { storageFactory, jsonReader, rosterNormalizer });
  }

  async importAll() {
    const metrics = {};
    metrics.users = await this.#upsertUsers();
    metrics.players = await this.#upsertSingle("createPlayerCatalogRepository", await this.jsonReader.readPlayers(), "id");
    metrics.rosters = await this.#upsertRosters(await this.jsonReader.readRosters());
    metrics.calendar = await this.#upsertCalendar(await this.jsonReader.readCalendar());
    metrics.opponents = await this.#upsertSingle("createOpponentTeamRepository", await this.jsonReader.readOpponents(), "id");
    metrics.matchData = await this.#saveMatchData(await this.jsonReader.readMatchData());
    metrics.notifications = await this.#upsertNotifications(await this.jsonReader.readNotifications());
    return { ok: true, metrics };
  }

  async #upsertUsers() {
    const repository = this.storageFactory.createUserRepository(); const users = await this.jsonReader.readUsers();
    for (const user of users) await repository.records.upsertRecord(user.id, user);
    return users.length;
  }

  async #upsertSingle(repositoryName, records, key) {
    const repository = this.storageFactory[repositoryName]();
    for (const record of records) await repository.records.upsertRecord(record[key], record);
    return records.length;
  }

  async #upsertRosters(rosters) {
    const repository = this.storageFactory.createRosterRepository();
    const normalizedRosters = this.rosterNormalizer.normalizeRosters(rosters);
    for (const roster of normalizedRosters) await repository.saveRoster(roster.userId, roster.month, roster.slots);
    return normalizedRosters.length;
  }

  async #upsertCalendar(calendar) {
    const repository = this.storageFactory.createCalendarRepository();
    await Promise.all([...calendar.tours.map((tour) => repository.tours.upsertRecord(tour.id, tour)),
      ...calendar.matches.map((match) => repository.matches.upsertRecord(match.id, match))]);
    return calendar.tours.length + calendar.matches.length;
  }

  async #saveMatchData(database) { await this.storageFactory.createMatchDataRepository().saveDatabase(database); return (database.matches || []).length; }
  async #upsertNotifications(records) { const repository = this.storageFactory.createNotificationSentRepository(); for (const record of records) await repository.markNotificationAsSent(record.userId, record.key); return records.length; }
}
