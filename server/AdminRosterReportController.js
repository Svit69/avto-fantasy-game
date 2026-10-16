export class AdminRosterReportController {
  constructor({ rosterView, rosterRepository, userRepository, playerCatalogRepository }) {
    Object.assign(this, { rosterView, rosterRepository, userRepository, playerCatalogRepository });
  }
  async renderReport(chatId, month, page = 0) {
    if (!month) return this.rosterView.renderMonthPrompt(chatId);
    const [rosters, users, players] = await Promise.all([this.rosterRepository.listRosters(), this.userRepository.listUsers(), this.playerCatalogRepository.listPlayers()]);
    return this.rosterView.renderMonthlyRosters(chatId, { month, page, rosters, users, players });
  }
}
