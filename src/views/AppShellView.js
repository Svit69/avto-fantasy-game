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
      </div>
    `;
  }
}
