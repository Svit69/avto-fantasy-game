export class SlotView {
  render(slot) {
    return slot.isFilled()
      ? this.#renderFilledSlot(slot)
      : this.#renderEmptySlot(slot);
  }

  #renderFilledSlot(slot) {
    const player = slot.getPlayer();
    return `
      <article class="player-slot">
        <div class="slot-role">${slot.getPosition()}</div>
        <div class="slot-name">${player.getLastName()}</div>
        <div class="slot-meta">${player.getFullName()}</div>
        <div class="slot-meta">Стоимость ${player.getFormattedPrice()}</div>
      </article>
    `;
  }

  #renderEmptySlot(slot) {
    return `
      <article class="player-slot slot-empty">
        <div class="slot-role">${slot.getPosition()}</div>
        <div class="slot-name">Свободный слот</div>
        <div class="slot-meta">Игрок не выбран</div>
      </article>
    `;
  }
}
