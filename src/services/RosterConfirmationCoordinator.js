import { RosterAnimationController } from "../controllers/RosterAnimationController.js";

export class RosterConfirmationCoordinator {
  constructor(options) { Object.assign(this, options); }
  async confirm() {
    const month = this.getSelectedMonth(); const slots = this.teamRoster.getSlots();
    const payload = this.teamRoster.createServerPayload();
    const isCurrent = () => month === this.getSelectedMonth() && slots.every((slot, index) => this.teamRoster.getSlots()[index] === slot)
      && JSON.stringify(this.teamRoster.createServerPayload()) === JSON.stringify(payload);
    await this.rosterSubmissionApiClient.submitConfirmedRoster(payload, month);
    if (!isCurrent()) return;
    await this.afterRosterSubmit();
    if (!isCurrent()) return;
    this.teamRoster.markConfirmed(); new RosterAnimationController(this.rootElement).animateRosterLock();
    this.rosterDomRenderer.renderRosterSections(); this.rosterDomRenderer.renderRosterConfirmation(month);
  }
}
