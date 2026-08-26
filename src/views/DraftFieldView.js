import { POSITION_LABELS, ROSTER_POSITIONS } from "../data/positions.js";

export class DraftFieldView {
  constructor(slotView) {
    this.slotView = slotView;
  }

  render(teamRoster) {
    return `
      <main class="scroll-area">
        <section class="draft-page">
          <div class="title-block">
            <h1 class="draft-title">ФЭНТЕЗИ ДРАФТ</h1>
            <p class="draft-subtitle">СОБЕРИ СОСТАВ</p>
          </div>
          ${this.#renderRosterLines(teamRoster)}
        </section>
      </main>
    `;
  }

  #renderRosterLines(teamRoster) {
    return Object.entries(POSITION_LABELS).map(([key, label]) => {
      const slots = this.#selectSlotsByPosition(teamRoster, key);
      return this.#renderLine(label, slots);
    }).join("");
  }

  #selectSlotsByPosition(teamRoster, positionKey) {
    return teamRoster.getSlots().filter((slot) => {
      return slot.getPosition() === ROSTER_POSITIONS[positionKey];
    });
  }

  #renderLine(label, slots) {
    return `
      <section class="line-group">
        <h2 class="line-title">${label}</h2>
        <div class="line-grid">${slots.map((slot) => this.slotView.render(slot)).join("")}</div>
      </section>
    `;
  }
}
