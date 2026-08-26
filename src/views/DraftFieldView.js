export class DraftFieldView {
  constructor(draftLineupView) {
    this.draftLineupView = draftLineupView;
  }

  render(teamRoster) {
    return `
      <main class="scroll-area">
        <section class="draft-page">
          <div class="title-block">
            <h1 class="draft-title">ФЭНТЕЗИ ДРАФТ</h1>
            <p class="draft-subtitle">СОБЕРИ СОСТАВ</p>
          </div>
          <div class="tactical-board">${this.draftLineupView.render(teamRoster)}</div>
        </section>
      </main>
    `;
  }
}
