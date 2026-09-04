export class MarketStatsTouchScroller {
  #dragging = false;
  #scrollLeft = 0;
  #syncScrollLeft;
  #touch = null;
  constructor(syncScrollLeft) { this.#syncScrollLeft = syncScrollLeft; }

  connect(container, scrollContainers) {
    container.addEventListener("touchstart", (event) => this.#startTouch(event), { passive: true });
    container.addEventListener("touchmove", (event) => this.#moveTouch(event, scrollContainers), { passive: false });
    container.addEventListener("touchend", () => this.#finishTouch(), { passive: true });
  }
  blockClickAfterDrag(event) {
    if (!this.#dragging) return;
    event.preventDefault();
    event.stopPropagation();
  }
  setScrollLeft(scrollLeft) { this.#scrollLeft = Math.max(0, scrollLeft); }

  #startTouch(event) {
    const touch = event.touches[0];
    this.#touch = { x: touch.clientX, y: touch.clientY, left: this.#scrollLeft, intent: null };
  }
  #moveTouch(event, scrollContainers) {
    if (!this.#touch) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - this.#touch.x;
    const deltaY = touch.clientY - this.#touch.y;
    this.#detectIntent(deltaX, deltaY);
    if (this.#touch.intent !== "horizontal") return;
    event.preventDefault();
    this.#dragging = true;
    this.#syncScrollLeft(scrollContainers, this.#touch.left - deltaX);
  }
  #detectIntent(deltaX, deltaY) {
    if (this.#touch.intent || Math.max(Math.abs(deltaX), Math.abs(deltaY)) <= 6) return;
    this.#touch.intent = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
  }
  #finishTouch() {
    this.#touch = null;
    setTimeout(() => { this.#dragging = false; }, 80);
  }
}
