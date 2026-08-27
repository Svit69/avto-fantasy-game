export class MarketStatsScrollSynchronizer {
  #syncing = false;

  connectSynchronizedStatsScroll(rootElement) {
    const scrollContainers = [...rootElement.querySelectorAll(".market-stats-scroll")];

    scrollContainers.forEach((container) => {
      container.addEventListener("scroll", () => {
        if (this.#syncing) return;
        this.#syncScrollLeft(scrollContainers, container.scrollLeft);
      }, { passive: true });
    });
  }

  #syncScrollLeft(scrollContainers, scrollLeft) {
    this.#syncing = true;
    scrollContainers.forEach((container) => {
      if (container.scrollLeft !== scrollLeft) {
        container.scrollLeft = scrollLeft;
      }
    });
    requestAnimationFrame(() => { this.#syncing = false; });
  }
}
