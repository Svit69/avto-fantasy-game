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
    this.#togglePinnedColumnShadow(scrollContainers[0], 0);
  }

  #syncScrollLeft(scrollContainers, scrollLeft) {
    this.#syncing = true;
    this.#togglePinnedColumnShadow(scrollContainers[0], scrollLeft);
    scrollContainers.forEach((container) => {
      if (container.scrollLeft !== scrollLeft) {
        container.scrollLeft = scrollLeft;
      }
    });
    requestAnimationFrame(() => { this.#syncing = false; });
  }

  #togglePinnedColumnShadow(container, scrollLeft) {
    container?.closest(".player-market")?.classList.toggle("is-stats-scrolled", scrollLeft > 1);
  }
}
