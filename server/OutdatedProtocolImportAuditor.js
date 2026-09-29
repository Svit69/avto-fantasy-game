export class OutdatedProtocolImportAuditor {
  constructor(currentVersion = "khl-protocol-pdf-v2") { this.currentVersion = currentVersion; }

  audit(database = {}) {
    const matchesById = new Map((database.matches || []).map((match) => [match.id, match]));
    const outdatedMatchIds = (database.events || []).reduce((matchIds, event) => {
      const version = String(event.sourceVersion || "");
      return version.startsWith("khl-protocol-pdf-") && version !== this.currentVersion
        ? matchIds.add(event.matchId) : matchIds;
    }, new Set());
    return [...outdatedMatchIds].map((matchId) => {
      const match = matchesById.get(matchId) || {};
      return { type: "outdated_pdf_import", matchId, gameId: match.gameId || "", league: match.league || "",
        teams: [match.homeTeam, match.awayTeam].filter(Boolean).join(" - "), currentVersion: this.currentVersion };
    });
  }
}
