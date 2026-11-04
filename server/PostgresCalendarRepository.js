import { PostgresSingleKeyJsonRepository } from "./PostgresSingleKeyJsonRepository.js";
import { CalendarRecordMerger } from "./CalendarRecordMerger.js";
import { OnlineCalendarScheduleEnricher } from "./OnlineCalendarScheduleEnricher.js";

export class PostgresCalendarRepository {
  constructor(database, seedTours, seedMatches, scheduleEnricher = new OnlineCalendarScheduleEnricher()) {
    Object.assign(this, { seedTours, seedMatches, scheduleEnricher, tours: new PostgresSingleKeyJsonRepository(database, "calendar_tours"),
      matches: new PostgresSingleKeyJsonRepository(database, "calendar_matches") });
  }

  async listCalendar() {
    const storedTours = await this.tours.listRecords();
    const storedMatches = await this.matches.listRecords();
    return this.scheduleEnricher.enrichCalendar({ tours: this.#merge(this.seedTours, storedTours), matches: this.#merge(this.seedMatches, storedMatches) });
  }

  async listTours() { return (await this.listCalendar()).tours; }
  async listMatches() { return (await this.listCalendar()).matches; }
  async updateMatchOnlineProtocolId(matchId, onlineProtocolId) {
    const match = (await this.listMatches()).find((item) => item.id === matchId);
    if (!match) throw new Error("calendar_match_not_found");
    return this.matches.upsertRecord(matchId, { ...match, onlineProtocolId: String(onlineProtocolId) });
  }

  #merge(seedRecords, storedRecords) {
    return new CalendarRecordMerger().mergeSeedAndStoredRecords(seedRecords, storedRecords);
  }
}
