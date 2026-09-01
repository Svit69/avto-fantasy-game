export class EmptyPlayerSlotView {
  render(position, orderIndex, editable = true) {
    const tiltClass = orderIndex % 2 === 0 ? "tilt-right" : "tilt-left";
    const disabled = editable ? "" : "disabled aria-disabled=\"true\"";

    return `
      <button class="empty-player-slot ${tiltClass}" type="button" ${disabled}>
        <span class="empty-slot-plus">+</span>
        <span class="empty-slot-title">ПУСТОЙ СЛОТ</span>
        <span class="empty-slot-action">ДОБАВИТЬ ИГРОКА</span>
        <span class="sr-only">${position}</span>
      </button>
    `;
  }
}
