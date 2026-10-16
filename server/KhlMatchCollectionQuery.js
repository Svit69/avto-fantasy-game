import { ImportedMatchGameSelector } from "./ImportedMatchGameSelector.js";

export class KhlMatchCollectionQuery {
  constructor(repository) { this.repository = repository; }
  async findMatchChildren(gameId, collectionName) {
    const database = await this.repository.readDatabase();
    const match = new ImportedMatchGameSelector().selectMatchByGameId(database.matches, gameId);
    return match ? database[collectionName].filter((item) => item.matchId === match.id) : [];
  }
}
