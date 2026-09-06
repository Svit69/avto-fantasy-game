import { PostgresSingleKeyJsonRepository } from "./PostgresSingleKeyJsonRepository.js";

export class PostgresOpponentTeamRepository {
  constructor(database, seedTeams) {
    Object.assign(this, { seedTeams, records: new PostgresSingleKeyJsonRepository(database, "opponent_teams") });
  }

  async listTeams() {
    const storedTeams = await this.records.listRecords();
    const teams = this.#merge(this.seedTeams, storedTeams);
    await Promise.all(teams.map((team) => this.records.upsertRecord(team.id, team)));
    return teams;
  }

  async findTeamByName(teamName) {
    return (await this.listTeams()).find((team) => team.name === teamName) || null;
  }

  #merge(seedTeams, storedTeams) {
    const seedIds = new Set(seedTeams.map((team) => team.id));
    return [...seedTeams, ...storedTeams.filter((team) => !seedIds.has(team.id))];
  }
}
