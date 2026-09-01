export const ROSTER_MODES = Object.freeze({
  draft: "draft",
  confirmed: "confirmed",
  editing: "editing",
  locked: "locked",
});

export class RosterLifecycle {
  constructor(mode = ROSTER_MODES.draft) { this.mode = mode; }
  getMode() { return this.mode; }
  isEditable() { return [ROSTER_MODES.draft, ROSTER_MODES.editing].includes(this.mode); }
  isConfirmed() { return this.mode === ROSTER_MODES.confirmed; }
  isLocked() { return this.mode === ROSTER_MODES.locked; }
  markConfirmed() { this.mode = ROSTER_MODES.confirmed; }
  markEditing() { if (!this.isLocked()) this.mode = ROSTER_MODES.editing; }
}
