export class VhlOnlineMatchCatalog {
  constructor(calendarRepository) {
    this.calendarRepository = calendarRepository;
  }

  async listManagedMatches() {
    const calendar = await this.calendarRepository.listCalendar();
    return calendar.matches.filter((match) => this.#isManagedVhlMatch(match)).sort((left, right) => Date.parse(left.startsAt) - Date.parse(right.startsAt));
  }

  async listManagedMonths() {
    const matches = await this.listManagedMatches();
    return [...new Set(matches.map((match) => match.startsAt.slice(0, 7)))];
  }

  async listMatchesForMonth(month) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return [];
    return (await this.listManagedMatches()).filter((match) => match.startsAt.startsWith(`${month}-`));
  }

  async findMatchById(matchId) {
    return (await this.listManagedMatches()).find((match) => match.id === matchId) || null;
  }

  #isManagedVhlMatch(match) {
    return match.league === "ВХЛ" && match.featuredTeam === "Горняк-УГМК";
  }
}
