export class RosterDomRenderer {
  constructor(rootElement, teamRoster, draftFieldView, footerView, slotRenderer, confirmationView) {
    this.rootElement = rootElement;
    this.teamRoster = teamRoster;
    this.draftFieldView = draftFieldView;
    this.footerView = footerView;
    this.slotRenderer = slotRenderer;
    this.confirmationView = confirmationView;
  }

  renderRosterSections() {
    this.rootElement.querySelector("[data-draft-field]").innerHTML =
      this.draftFieldView.render(this.teamRoster);
    this.renderFooter();
  }

  renderSlotByIndex(slotIndex) {
    const slotElement = this.rootElement.querySelector(`[data-roster-slot="${slotIndex}"]`);
    const orderIndex = Number(slotElement?.dataset.slotOrder);
    const slot = this.teamRoster.getSlotByIndex(slotIndex);

    if (!slot || !slotElement) return;
    const showPoints = this.teamRoster.getTourAccessState()?.isLocked;
    slotElement.innerHTML = this.slotRenderer.renderSlotContent(slot, orderIndex, showPoints);
  }

  renderFooter() {
    this.rootElement.querySelector("[data-roster-footer]").innerHTML =
      this.footerView.render(this.teamRoster);
  }

  renderRosterConfirmation(month) {
    this.rootElement.querySelector("[data-roster-confirmation-root]").innerHTML =
      this.confirmationView.render(this.teamRoster.getTourAccessState(), month);
    document.body.classList.add("is-roster-confirmation-open");
    this.rootElement.querySelector(".roster-confirmation-actions button")?.focus();
  }
}
