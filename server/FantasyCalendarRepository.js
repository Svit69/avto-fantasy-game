import fs from "node:fs/promises";
import path from "node:path";

export class FantasyCalendarRepository {
  constructor(filePath, seedTours, seedMatches) {
    Object.assign(this, { filePath, seedTours, seedMatches });
  }

  async listCalendar() {
    const storedCalendar = await this.#readStoredCalendar();
    const calendar = {
      tours: this.#mergeRecords(this.seedTours, storedCalendar.tours),
      matches: this.#mergeRecords(this.seedMatches, storedCalendar.matches),
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

  async #readStoredCalendar() {
    try {
      const payload = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      return { tours: Array.isArray(payload.tours) ? payload.tours : [], matches: Array.isArray(payload.matches) ? payload.matches : [] };
    } catch {
      return { tours: [], matches: [] };
    }
  }

  #mergeRecords(seedRecords, storedRecords) {
    const seedIds = new Set(seedRecords.map((record) => record.id));
    return [...seedRecords, ...storedRecords.filter((record) => !seedIds.has(record.id))];
  }

  async #writeCalendar(calendar) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(calendar, null, 2), "utf8");
  }
}
