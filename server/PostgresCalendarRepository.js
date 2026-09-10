import { PostgresSingleKeyJsonRepository } from "./PostgresSingleKeyJsonRepository.js";

export class PostgresCalendarRepository {
  constructor(database, seedTours, seedMatches) {
    Object.assign(this, { seedTours, seedMatches, tours: new PostgresSingleKeyJsonRepository(database, "calendar_tours"),
      matches: new PostgresSingleKeyJsonRepository(database, "calendar_matches") });
  }

  async listCalendar() {
    const storedTours = await this.tours.listRecords();
    const storedMatches = await this.matches.listRecords();
    return { tours: this.#merge(this.seedTours, storedTours), matches: this.#merge(this.seedMatches, storedMatches) };
  }

  async listTours() { return (await this.listCalendar()).tours; }
  async listMatches() { return (await this.listCalendar()).matches; }
  async updateMatchOnlineProtocolId(matchId, onlineProtocolId) {
    const match = (await this.listMatches()).find((item) => item.id === matchId);
    if (!match) throw new Error("calendar_match_not_found");
    return this.matches.upsertRecord(matchId, { ...match, onlineProtocolId: String(onlineProtocolId) });
  }

  #merge(seedRecords, storedRecords) {
    const storedById = new Map(storedRecords.map((record) => [record.id, record]));
    const seedIds = new Set(seedRecords.map((record) => record.id));
    return [...seedRecords.map((record) => storedById.get(record.id) || record), ...storedRecords.filter((record) => !seedIds.has(record.id))];
  }
}
