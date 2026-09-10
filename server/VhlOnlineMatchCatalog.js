export class VhlOnlineMatchCatalog {
  constructor(calendarRepository) {
    this.calendarRepository = calendarRepository;
  }

  async listManagedMatches() {
    const calendar = await this.calendarRepository.listCalendar();
    return calendar.matches.filter((match) => this.#isManagedVhlMatch(match)).sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));
  }

  async findMatchById(matchId) {
    return (await this.listManagedMatches()).find((match) => match.id === matchId) || null;
  }

  #isManagedVhlMatch(match) {
    return match.league === "ВХЛ" && match.featuredTeam === "Горняк-УГМК" && match.status !== "finished";
  }
}
