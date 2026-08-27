import { POSITION_LABELS, ROSTER_POSITIONS } from "../data/positions.js";

export class DraftLineupView {
  constructor(rosterSlotDomRenderer) {
    this.rosterSlotDomRenderer = rosterSlotDomRenderer;
  }

  render(teamRoster) {
    return Object.entries(POSITION_LABELS).map(([key, label], index) => {
      const slots = this.#selectSlotsByPosition(teamRoster, key);
      return this.#renderTacticalLine(key, label, slots, index);
    }).join("");
  }

  #selectSlotsByPosition(teamRoster, positionKey) {
    return teamRoster.getSlots().filter((slot) => {
      return slot.getPosition() === ROSTER_POSITIONS[positionKey];
    });
  }

  #renderTacticalLine(positionKey, label, slots, lineIndex) {
    return `
      <section class="lineup-section lineup-${positionKey}">
        <h2 class="line-label">${this.#formatLineLabel(label, lineIndex)}</h2>
        <div class="rink-marker"></div>
        <div class="lineup-grid">${this.#renderSlots(slots)}</div>
      </section>
    `;
  }

  #renderSlots(slots) {
    return slots.map((slot, index) => {
      const slotIndex = this.#findSlotIndex(slot);
      const slotContent = this.#renderSlotContent(slot, index, slotIndex);
      return `<div class="lineup-slot" data-roster-slot="${slotIndex}" data-slot-order="${index}">${slotContent}</div>`;
    }).join("");
  }

  #renderSlotContent(slot, index, slotIndex) {
    return this.rosterSlotDomRenderer.renderSlotContent(slot, index);
  }

  #formatLineLabel(label, lineIndex) {
    const starts = ["‹‹", "‹‹‹", "‹‹"];
    const ends = ["››", "›››", "››"];
    return `${starts[lineIndex]} ${label.toUpperCase()} ${ends[lineIndex]}`;
  }

  #findSlotIndex(slot) {
    return slot.getIndex();
  }
}
