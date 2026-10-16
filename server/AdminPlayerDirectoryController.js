import { AdminPlayerDirectoryView } from "./AdminPlayerDirectoryView.js";
export class AdminPlayerDirectoryController {
  constructor(playerCatalogRepository, view = new AdminPlayerDirectoryView()) { Object.assign(this, { playerCatalogRepository, view }); }
  async executeRoute({ route, chatId }) {
    const players = await this.playerCatalogRepository.listPlayers();
    if (route.type === "players") return this.view.renderTeams(chatId, players);
    if (route.type === "player_team") return this.view.renderPositions(chatId, players, route.playerId);
    return this.view.renderPlayers(chatId, players, route.playerId, route.value);
  }
}
