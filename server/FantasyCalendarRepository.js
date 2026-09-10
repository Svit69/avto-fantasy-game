import fs from "node:fs/promises";
import path from "node:path";
import { CalendarMatchOnlineProtocolUpdater } from "./CalendarMatchOnlineProtocolUpdater.js";
import { CalendarRecordMerger } from "./CalendarRecordMerger.js";

export class FantasyCalendarRepository {
  constructor(filePath, seedTours, seedMatches, merger = new CalendarRecordMerger(), protocolUpdater = new CalendarMatchOnlineProtocolUpdater()) {
    Object.assign(this, { filePath, seedTours, seedMatches, merger, protocolUpdater });
  }

  async listCalendar() {
    const storedCalendar = await this.#readStoredCalendar();
    const calendar = {
      tours: this.merger.mergeSeedAndStoredRecords(this.seedTours, storedCalendar.tours),
      matches: this.merger.mergeSeedAndStoredRecords(this.seedMatches, storedCalendar.matches),
    };
    if (JSON.stringify(calendar) !== JSON.stringify(storedCalendar)) await this.#writeCalendar(calendar);
    return calendar;
  }

  async listTours() {
    return (await this.listCalendar()).tours;
  }

  async listMatches() {
    return (await this.listCalendar()).matches;
  }

  async updateMatchOnlineProtocolId(matchId, onlineProtocolId) {
    const result = this.protocolUpdater.createUpdatedCalendar(await this.listCalendar(), matchId, onlineProtocolId);
    await this.#writeCalendar(result.calendar);
    return result.match;
  }

  async #readStoredCalendar() {
    try {
      const payload = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      return { tours: Array.isArray(payload.tours) ? payload.tours : [], matches: Array.isArray(payload.matches) ? payload.matches : [] };
    } catch {
      return { tours: [], matches: [] };
    }
  }

  async #writeCalendar(calendar) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(calendar, null, 2), "utf8");
  }
}
