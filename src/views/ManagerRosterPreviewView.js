import { ROSTER_MODES } from "../models/RosterLifecycle.js";
import { RosterFactory } from "../services/RosterFactory.js";

export class ManagerRosterPreviewView {
  constructor(rosterFactory = new RosterFactory()) {
    this.rosterFactory = rosterFactory;
  }

  render(entry, players, lineupView) {
    const roster = this.rosterFactory.createRosterFromSavedRoster(players, { slots: entry.slots }, ROSTER_MODES.locked);
    return `<div class="standings-scrim" data-close-standings></div>
      <section class="manager-roster-preview" role="dialog" aria-modal="true" aria-label="Состав менеджера">
        <header class="manager-preview-header">
          <button class="manager-preview-back" type="button" data-back-standings>‹</button>
          <div><h1>${entry.name}</h1><p>${entry.points} оч.</p></div>
          <button class="manager-preview-close" type="button" data-close-standings>×</button>
        </header>
        <main class="manager-preview-body">
          <div class="tactical-board">${lineupView.render(roster)}</div>
        </main>
      </section>`;
  }
}
