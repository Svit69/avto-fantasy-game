export class OpponentTeamController {
  constructor({ jsonResponder, opponentTeamRepository }) {
    Object.assign(this, { jsonResponder, opponentTeamRepository });
  }

  async handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const teams = await this.opponentTeamRepository.listTeams();
    return this.jsonResponder.sendJson(response, 200, { teams });
  }
}
