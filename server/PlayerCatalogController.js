export class PlayerCatalogController {
  constructor({ jsonResponder, playerCatalogRepository }) {
    Object.assign(this, { jsonResponder, playerCatalogRepository });
  }

  async handleRequest(request, response) {
    if (request.method !== "GET") return this.jsonResponder.sendJson(response, 405, { error: "method_not_allowed" });
    const players = (await this.playerCatalogRepository.listPlayers()).filter((player) => player.status !== "left_game");
    return this.jsonResponder.sendJson(response, 200, { players });
  }
}
