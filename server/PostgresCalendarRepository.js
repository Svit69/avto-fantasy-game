import { PostgresSingleKeyJsonRepository } from "./PostgresSingleKeyJsonRepository.js";

export class PostgresCalendarRepository {
  constructor(database, seedTours, seedMatches) {
    Object.assign(this, { seedTours, seedMatches, tours: new PostgresSingleKeyJsonRepository(database, "calendar_tours"),
      matches: new PostgresSingleKeyJsonRepository(database, "calendar_matches") });
  }

  async listCalendar() {
    const storedTours = await this.tours.listRecords();
    const storedMatches = await this.matches.listRecords();
    const calendar = { tours: this.#merge(this.seedTours, storedTours), matches: this.#merge(this.seedMatches, storedMatches) };
    await Promise.all([...calendar.tours.map((tour) => this.tours.upsertRecord(tour.id, tour)),
      ...calendar.matches.map((match) => this.matches.upsertRecord(match.id, match))]);
    return calendar;
  }

  async listTours() { return (await this.listCalendar()).tours; }
  async listMatches() { return (await this.listCalendar()).matches; }

  #merge(seedRecords, storedRecords) {
    const seedIds = new Set(seedRecords.map((record) => record.id));
    return [...seedRecords, ...storedRecords.filter((record) => !seedIds.has(record.id))];
  }
}
