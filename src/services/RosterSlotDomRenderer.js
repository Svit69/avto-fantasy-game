export class RosterSlotDomRenderer {
  constructor(playerCardView, emptyPlayerSlotView) {
    this.playerCardView = playerCardView;
    this.emptyPlayerSlotView = emptyPlayerSlotView;
  }

  renderSlotContent(slot, orderIndex, showPoints = true) {
    if (slot.isFilled()) {
      return this.#renderFilledSlot(slot, orderIndex, showPoints);
    }

    return this.emptyPlayerSlotView.render(slot.getPosition(), orderIndex, slot.isEditable());
  }

  #renderFilledSlot(slot, orderIndex, showPoints) {
    const cardProps = slot.getPlayer().getCardProps(true);
    return this.playerCardView.render({ ...cardProps, editable: slot.isEditable(), showPoints }, orderIndex, slot.getIndex());
  }
}
