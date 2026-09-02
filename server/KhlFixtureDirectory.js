import path from "node:path";

export class KhlFixtureDirectory {
  constructor(rootDirectory) { this.rootDirectory = rootDirectory; }
  resolveMatchDirectory(tournamentId, gameId) { return path.join(this.rootDirectory, `${tournamentId}-${gameId}`); }
  resolveManifestPath(tournamentId, gameId) { return path.join(this.resolveMatchDirectory(tournamentId, gameId), "manifest.json"); }
}
