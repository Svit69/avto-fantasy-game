export class RosterDomRenderer {
  constructor(rootElement, teamRoster, draftFieldView, footerView, slotRenderer) {
    this.rootElement = rootElement;
    this.teamRoster = teamRoster;
    this.draftFieldView = draftFieldView;
    this.footerView = footerView;
    this.slotRenderer = slotRenderer;
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
    slotElement.innerHTML = this.slotRenderer.renderSlotContent(slot, orderIndex);
  }

  renderFooter() {
    this.rootElement.querySelector("[data-roster-footer]").innerHTML =
      this.footerView.render(this.teamRoster);
  }
}
