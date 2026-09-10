export class CalendarRecordMerger {
  mergeSeedAndStoredRecords(seedRecords, storedRecords) {
    const storedById = new Map(storedRecords.map((record) => [record.id, record]));
    const seedIds = new Set(seedRecords.map((record) => record.id));
    const mergedSeeds = seedRecords.map((record) => storedById.get(record.id) || record);
    return [...mergedSeeds, ...storedRecords.filter((record) => !seedIds.has(record.id))];
  }
}
