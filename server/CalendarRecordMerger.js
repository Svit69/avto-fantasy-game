import { CalendarProtocolIdBackfillPolicy } from "./CalendarProtocolIdBackfillPolicy.js";
import { CalendarMatchStartTimeCorrectionPolicy } from "../src/data/CalendarMatchStartTimeCorrectionPolicy.js";

export class CalendarRecordMerger {
  constructor(protocolPolicy = new CalendarProtocolIdBackfillPolicy(), timeCorrection = new CalendarMatchStartTimeCorrectionPolicy()) {
    Object.assign(this, { protocolPolicy, timeCorrection });
  }
  mergeSeedAndStoredRecords(seedRecords, storedRecords) {
    const storedById = new Map(storedRecords.map((record) => [record.id, this.timeCorrection.applyCorrection(record)]));
    const seedIds = new Set(seedRecords.map((record) => record.id));
    const mergedSeeds = seedRecords.map((record) => this.protocolPolicy.mergeRecord(record, storedById.get(record.id)));
    return [...mergedSeeds, ...storedRecords.filter((record) => !seedIds.has(record.id))];
  }
}
