export class StandingsModalLoader {
  #version = 0;
  #loadingMore = null;
  constructor(apiClient, view, getRoot, onLoaded) { Object.assign(this, { apiClient, view, getRoot, onLoaded }); }
  async loadMonth(month) {
    const version = ++this.#version;
    this.#loadingMore = null;
    this.getRoot().innerHTML = this.view.renderLoading(month);
    try {
      const standings = await this.apiClient.loadMonthlyStandings(month);
      if (version === this.#version) this.onLoaded(standings);
    } catch {
      if (version === this.#version) this.getRoot().innerHTML = this.view.renderError(month);
    }
  }
  cancel() { this.#version += 1; this.#loadingMore = null; }
  async loadNextPage(current) {
    if (this.#loadingMore !== null || current?.nextOffset == null) return;
    const version = this.#version; this.#loadingMore = version;
    const root = this.getRoot(); const button = root.querySelector("[data-more-standings]");
    if (button) button.disabled = true;
    try {
      const page = await this.apiClient.loadMonthlyStandings(current.month, false, current.nextOffset, current.version);
      if (version !== this.#version) return;
      const scrollTop = root.querySelector(".standings-modal")?.scrollTop || 0;
      const entries = page.offset === 0 ? page.entries : [...new Map([...current.entries, ...page.entries].map((entry) => [entry.userId, entry])).values()];
      this.onLoaded({ ...page, entries });
      const modal = root.querySelector(".standings-modal"); if (modal && page.offset !== 0) modal.scrollTop = scrollTop;
    } catch { if (version === this.#version && button) { button.disabled = false; button.textContent = "Повторить загрузку"; } }
    finally { if (this.#loadingMore === version) this.#loadingMore = null; }
  }
}
