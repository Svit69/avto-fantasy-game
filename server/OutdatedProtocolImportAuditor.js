export class OutdatedProtocolImportAuditor {
  constructor(currentVersion = "khl-protocol-pdf-v2") { this.currentVersion = currentVersion; }

  audit(events = []) {
    const outdatedMatchIds = events.reduce((matchIds, event) => {
      const version = String(event.sourceVersion || "");
      return version.startsWith("khl-protocol-pdf-") && version !== this.currentVersion
        ? matchIds.add(event.matchId) : matchIds;
    }, new Set());
    return [...outdatedMatchIds].map((matchId) => ({ type: "outdated_pdf_import", matchId,
      currentVersion: this.currentVersion }));
  }
}
