import { MHL_OPPONENT_TEAMS } from "../src/data/mhlOpponentTeams.js";

export class MhlTeamNameNormalizer {
  constructor() {
    this.names = new Map(MHL_OPPONENT_TEAMS.map((team) => [this.#key(team.name), team.name]));
    for (const [alias, name] of Object.entries({ Авто: "МХК Авто", "Спутник Ал": "Спутник", Спартак: "МХК Спартак" })) this.names.set(this.#key(alias), name);
  }
  normalizeTeamName(name) { return this.names.get(this.#key(name)) || String(name || "").trim(); }
  #key(value) { return String(value || "").trim().toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " "); }
}
