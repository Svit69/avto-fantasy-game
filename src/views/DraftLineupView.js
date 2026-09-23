import { POSITION_LABELS, ROSTER_POSITIONS } from "../data/positions.js";

export class DraftLineupView {
  constructor(rosterSlotDomRenderer) {
    this.rosterSlotDomRenderer = rosterSlotDomRenderer;
  }

  render(teamRoster) {
    return Object.entries(POSITION_LABELS).map(([key, label], index) => {
      const slots = this.#selectSlotsByPosition(teamRoster, key);
      return this.#renderTacticalLine(key, label, slots, index, teamRoster.getTourAccessState()?.isLocked);
    }).join("");
  }

  #selectSlotsByPosition(teamRoster, positionKey) {
    return teamRoster.getSlots().filter((slot) => {
      return slot.getPosition() === ROSTER_POSITIONS[positionKey];
    });
  }

  #renderTacticalLine(positionKey, label, slots, lineIndex, showPoints) {
    return `
      <section class="lineup-section lineup-${positionKey}">
        <h2 class="line-label">${this.#formatLineLabel(label, lineIndex)}</h2>
        <div class="rink-marker"></div>
        <div class="lineup-grid">${this.#renderSlots(slots, showPoints)}</div>
      </section>
    `;
  }

  #renderSlots(slots, showPoints) {
    return slots.map((slot, index) => {
      const slotIndex = slot.getIndex();
      const slotContent = this.rosterSlotDomRenderer.renderSlotContent(slot, index, showPoints);
      return `<div class="lineup-slot" data-roster-slot="${slotIndex}" data-slot-order="${index}">${slotContent}</div>`;
    }).join("");
  }

  #formatLineLabel(label, lineIndex) {
    const starts = ["‹‹", "‹‹‹", "‹‹"];
    const ends = ["››", "›››", "››"];
    return `${starts[lineIndex]} ${label.toUpperCase()} ${ends[lineIndex]}`;
  }
}
