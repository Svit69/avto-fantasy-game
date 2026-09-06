import { LoadingScreenView } from "./LoadingScreenView.js";

export class AppShellView {
  constructor(headerView, loadingScreenView = new LoadingScreenView()) {
    Object.assign(this, { headerView, loadingScreenView });
  }

  render() {
    return `
      <div class="app">
        ${this.headerView.render()}
        ${this.loadingScreenView.render()}
        <div data-draft-field></div>
        <div data-roster-footer></div>
        <div data-player-selection-root></div>
        <div data-manager-menu-root></div>
        <div data-player-profile-root></div>
        <div data-standings-root></div>
        <div data-auth-root></div>
        <div data-onboarding-root></div>
      </div>
    `;
  }
}
