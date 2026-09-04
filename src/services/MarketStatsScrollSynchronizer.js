import { MarketStatsTouchScroller } from "./MarketStatsTouchScroller.js";

export class MarketStatsScrollSynchronizer {
  #syncing = false;
  #touchScroller = new MarketStatsTouchScroller((containers, scrollLeft) => this.#syncScrollLeft(containers, scrollLeft));

  connectSynchronizedStatsScroll(rootElement) {
    const scrollContainers = [...rootElement.querySelectorAll(".market-stats-scroll")];
    scrollContainers.forEach((container) => {
      this.#touchScroller.connect(container, scrollContainers);
      container.addEventListener("scroll", () => {
        if (this.#syncing) return;
        this.#syncScrollLeft(scrollContainers, container.scrollLeft);
      }, { passive: true });
    });
    rootElement.addEventListener("click", (event) => this.#touchScroller.blockClickAfterDrag(event), true);
    this.#togglePinnedColumnShadow(scrollContainers[0], 0);
  }

  #syncScrollLeft(scrollContainers, scrollLeft) {
    this.#syncing = true;
    scrollContainers.forEach((container) => {
      if (container.scrollLeft !== scrollLeft) {
        container.scrollLeft = Math.max(0, scrollLeft);
      }
    });
    const actualScrollLeft = scrollContainers[0]?.scrollLeft || 0;
    this.#touchScroller.setScrollLeft(actualScrollLeft);
    this.#togglePinnedColumnShadow(scrollContainers[0], actualScrollLeft);
    requestAnimationFrame(() => { this.#syncing = false; });
  }

  #togglePinnedColumnShadow(container, scrollLeft) {
    container?.closest(".player-market")?.classList.toggle("is-stats-scrolled", scrollLeft > 1);
  }
}
