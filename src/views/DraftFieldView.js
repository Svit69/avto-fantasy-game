export class DraftFieldView {
  constructor(draftLineupView) {
    this.draftLineupView = draftLineupView;
  }

  render(teamRoster) {
    return `
      <main class="scroll-area">
        <section class="draft-page">
          <div class="title-block">
            <h1 class="draft-title">ФЭНТЕЗИ СОСТАВ</h1>
            <p class="draft-subtitle">СОБЕРИ СОСТАВ</p>
            ${this.#renderDeadlineCountdown(teamRoster)}
          </div>
          <div class="tactical-board">${this.draftLineupView.render(teamRoster)}</div>
        </section>
      </main>
    `;
  }

  #renderDeadlineCountdown(teamRoster) {
    const state = teamRoster.getTourAccessState?.();
    if (!state?.isOpen || state.isLocked || !state.deadlineAt) return "";
    return `<div class="deadline-countdown" data-deadline-countdown data-deadline-at="${state.deadlineAt}">
      <span>ОБРАТНЫЙ ОТСЧЕТ ДО НАЧАЛА ТУРА</span>
      <strong data-countdown-value>00 : 00 : 00</strong>
      <small>ДНИ&nbsp;&nbsp;&nbsp;ЧАСЫ&nbsp;&nbsp;&nbsp;МИН</small>
    </div>`;
  }
}
