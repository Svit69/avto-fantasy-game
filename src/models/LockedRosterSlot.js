import { RosterSlot } from "./RosterSlot.js";

export class LockedRosterSlot extends RosterSlot {
  isFilled() {
    return false;
  }

  getActionLabel() {
    return "Скоро откроется";
  }
}
