import fs from "node:fs/promises";
import path from "node:path";

export class OpponentTeamRepository {
  constructor(filePath, seedTeams) {
    Object.assign(this, { filePath, seedTeams });
  }

  async listTeams() {
    const storedTeams = await this.#readStoredTeams();
    const teams = this.#mergeTeams(this.seedTeams, storedTeams);
    if (teams.length !== storedTeams.length) await this.#writeTeams(teams);
    return teams;
  }

  async findTeamByName(teamName) {
    return (await this.listTeams()).find((team) => team.name === teamName) || null;
  }

  async #readStoredTeams() {
    try {
      const payload = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      return Array.isArray(payload.teams) ? payload.teams : [];
    } catch {
      return [];
    }
  }

  #mergeTeams(seedTeams, storedTeams) {
    return [...new Map([...seedTeams, ...storedTeams].map((team) => [team.id, team])).values()];
  }

  async #writeTeams(teams) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify({ teams }, null, 2), "utf8");
  }
}
