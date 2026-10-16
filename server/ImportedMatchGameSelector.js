import { ImportedMatchPriorityPolicy } from "./ImportedMatchPriorityPolicy.js";

export class ImportedMatchGameSelector {
  selectMatchByGameId(matches, gameId) {
    const policy = new ImportedMatchPriorityPolicy();
    return matches.filter((match) => String(match.gameId) === String(gameId))
      .reduce((selected, match) => policy.compare(match, selected) >= 0 ? match : selected, null);
  }
}
