export class AppShellView {
  constructor(headerView) {
    this.headerView = headerView;
  }

  render() {
    return `
      <div class="app">
        ${this.headerView.render()}
        <div data-draft-field></div>
        <div data-roster-footer></div>
        <div data-player-selection-root></div>
        <div data-manager-menu-root></div>
        <div data-player-profile-root></div>
      </div>
    `;
  }
}
