export class KhlMatchCollectionDeduplicator {
  deduplicateCollections(collections) {
    return {
      events: this.#deduplicateByKey(collections.events || [], (event) => event.id || event.eventKey || event.sourceHash),
      pointEntries: this.#deduplicateByKey(collections.pointEntries || [], (entry) => entry.id),
      playerStats: this.#deduplicateByKey(collections.playerStats || [], (stat) => `${stat.matchId}:${stat.playerId}`),
    };
  }

  #deduplicateByKey(records, createKey) {
    const indexed = new Map();
    for (const record of records) {
      const key = createKey(record);
      if (key) indexed.set(String(key), { ...indexed.get(String(key)), ...record });
    }
    return [...indexed.values()];
  }
}
