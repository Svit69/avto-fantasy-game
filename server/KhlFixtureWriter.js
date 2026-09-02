import fs from "node:fs/promises";
import path from "node:path";

export class KhlFixtureWriter {
  async writeFixture(matchDirectory, payload, rawSnapshot = payload) {
    await fs.mkdir(matchDirectory, { recursive: true });
    await fs.writeFile(path.join(matchDirectory, "001-imported.json"), JSON.stringify(payload, null, 2), "utf8");
    await fs.writeFile(path.join(matchDirectory, "001-raw-sanitized.json"), JSON.stringify(rawSnapshot, null, 2), "utf8");
    await fs.writeFile(path.join(matchDirectory, "manifest.json"), JSON.stringify(this.#createManifest(payload), null, 2), "utf8");
  }

  #createManifest(payload) {
    return { tournamentId: String(payload.match?.tournamentId), gameId: String(payload.match?.gameId),
      league: payload.match?.league || "КХЛ", team: "Автомобилист", snapshots: [{ file: "001-imported.json", offsetSeconds: 0 }] };
  }
}
