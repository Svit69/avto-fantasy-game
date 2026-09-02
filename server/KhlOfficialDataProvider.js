export class KhlOfficialDataProvider {
  async getMatch() { return this.#throwUnavailable(); }
  async getPlayByPlay() { return this.#throwUnavailable(); }
  async getProtocol() { return this.#throwUnavailable(); }
  async getLineups() { return this.#throwUnavailable(); }

  #throwUnavailable() {
    throw new Error("Прямой источник КХЛ недоступен. Используйте официальный feed или ручной импорт fixture.");
  }
}
