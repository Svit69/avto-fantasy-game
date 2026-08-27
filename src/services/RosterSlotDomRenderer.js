export class RosterSlotDomRenderer {
  constructor(playerCardView, emptyPlayerSlotView) {
    this.playerCardView = playerCardView;
    this.emptyPlayerSlotView = emptyPlayerSlotView;
  }

  renderSlotContent(slot, orderIndex) {
    if (slot.isFilled()) {
      return this.#renderFilledSlot(slot, orderIndex);
    }

    return this.emptyPlayerSlotView.render(slot.getPosition(), orderIndex);
  }

  #renderFilledSlot(slot, orderIndex) {
    const cardProps = slot.getPlayer().getCardProps(true);
    return this.playerCardView.render(cardProps, orderIndex, slot.getIndex());
  }
}
