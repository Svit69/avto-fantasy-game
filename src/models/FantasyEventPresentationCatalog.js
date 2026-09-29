export class FantasyEventPresentationCatalog {
  listDefinitions() {
    return [
      this.#create("goals", "гол", "гола", "голов"), this.#create("assists", "передача", "передачи", "передач"),
      this.#create("shotsOnGoal", "бросок в створ", "броска в створ", "бросков в створ"),
      this.#create("blockedShots", "блокированный бросок", "блокированных броска", "блокированных бросков"),
      this.#create("hits", "силовой приём", "силовых приёма", "силовых приёмов"),
      this.#create("takeaways", "отбор", "отбора", "отборов"), this.#create("interceptions", "перехват", "перехвата", "перехватов"),
      this.#create("saves", "сейв", "сейва", "сейвов"),
      this.#create("goalsAgainst", "пропущенный гол", "пропущенных гола", "пропущенных голов"),
      this.#create("penalties", "удаление", "удаления", "удалений"),
    ];
  }

  findDefinition(key) { return this.listDefinitions().find((definition) => definition.key === key); }
  #create(key, one, few, many) { return { key, words: [one, few, many] }; }
}
