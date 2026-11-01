import { CalendarProtocolIdBackfillPolicy } from "./CalendarProtocolIdBackfillPolicy.js";

export class CalendarRecordMerger {
  constructor(protocolPolicy = new CalendarProtocolIdBackfillPolicy()) { this.protocolPolicy = protocolPolicy; }
  mergeSeedAndStoredRecords(seedRecords, storedRecords) {
    const storedById = new Map(storedRecords.map((record) => [record.id, record]));
    const seedIds = new Set(seedRecords.map((record) => record.id));
    const mergedSeeds = seedRecords.map((record) => this.protocolPolicy.mergeRecord(record, storedById.get(record.id)));
    return [...mergedSeeds, ...storedRecords.filter((record) => !seedIds.has(record.id))];
  }
}
