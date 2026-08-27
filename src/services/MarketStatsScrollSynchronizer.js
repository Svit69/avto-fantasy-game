export class MarketStatsScrollSynchronizer {
  connectSynchronizedStatsScroll(rootElement) {
    const scrollContainers = [...rootElement.querySelectorAll(".market-stats-scroll")];

    scrollContainers.forEach((container) => {
      container.addEventListener("scroll", () => {
        this.#syncScrollLeft(scrollContainers, container.scrollLeft);
      }, { passive: true });
    });
  }

  #syncScrollLeft(scrollContainers, scrollLeft) {
    scrollContainers.forEach((container) => {
      if (container.scrollLeft !== scrollLeft) {
        container.scrollLeft = scrollLeft;
      }
    });
  }
}
