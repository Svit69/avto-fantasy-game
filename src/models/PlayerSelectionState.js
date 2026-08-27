export class PlayerSelectionState {
  constructor() {
    this.activeSlotIndex = null;
    this.activeFilter = null;
    this.drawerOpen = false;
    this.shouldAnimateDrawer = false;
    this.filters = { position: "Все", team: "Все", maxPrice: 13 };
  }

  openForSlot(slot) {
    this.activeSlotIndex = slot.getIndex();
    this.activeFilter = null;
    this.drawerOpen = true;
    this.shouldAnimateDrawer = true;
    this.filters.position = slot.getPosition();
  }

  openForPlayerSearch() {
    this.activeSlotIndex = null;
    this.activeFilter = null;
    this.drawerOpen = true;
    this.shouldAnimateDrawer = true;
    this.filters.position = "Все";
  }

  closeDrawer() {
    this.activeSlotIndex = null;
    this.activeFilter = null;
    this.drawerOpen = false;
  }

  openFilter(kind) { this.activeFilter = kind; }

  closeFilter() { this.activeFilter = null; }

  applyFilter(kind, value) {
    this.filters[kind === "price" ? "maxPrice" : kind] = kind === "price" ? Number(value) : value;
  }

  isOpen() { return this.drawerOpen; }

  consumeDrawerAnimationFlag() {
    const shouldAnimate = this.shouldAnimateDrawer;
    this.shouldAnimateDrawer = false;
    return shouldAnimate;
  }
}
