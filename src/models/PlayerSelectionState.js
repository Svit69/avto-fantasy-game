export class PlayerSelectionState {
  constructor() {
    this.activeSlotIndex = null;
    this.activeFilter = null;
    this.filters = { position: "нападающий", team: "Все", maxPrice: 13 };
  }

  openForSlot(slot) {
    this.activeSlotIndex = slot.getIndex();
    this.activeFilter = null;
    this.filters.position = slot.getPosition();
  }

  closeDrawer() {
    this.activeSlotIndex = null;
    this.activeFilter = null;
  }

  openFilter(kind) {
    this.activeFilter = kind;
  }

  closeFilter() {
    this.activeFilter = null;
  }

  applyFilter(kind, value) {
    this.filters[kind === "price" ? "maxPrice" : kind] = kind === "price" ? Number(value) : value;
  }

  isOpen() {
    return this.activeSlotIndex !== null;
  }
}
