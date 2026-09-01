export class FooterView {
  render(teamRoster) {
    const filledCount = teamRoster.calculateFilledPlayersCount();
    const totalCount = teamRoster.calculateTotalSlotsCount();
    const remainingBudget = teamRoster.getBudgetLimit() - teamRoster.calculateSelectedPlayersPrice();
    const budgetState = remainingBudget < 0 ? "is-over-budget" : "";
    const isComplete = filledCount === totalCount;
    const action = this.#createActionState(teamRoster, isComplete);

    return `
      <footer class="app-footer">
        <div class="footer-content">
          <div class="footer-stats">
            <div>
              <div class="stat-label">Бюджет</div>
              <div class="budget-value ${budgetState}"><b>${remainingBudget}к</b></div>
            </div>
            <div>
              <div class="stat-label">Игроков заполнено</div>
              <div class="stat-value">${filledCount}/${totalCount}</div>
            </div>
          </div>
          <button class="confirm-button ${action.className}" type="button" ${action.data} ${action.disabled}>${action.text}</button>
        </div>
      </footer>
    `;
  }

  #createActionState(teamRoster, isComplete) {
    if (teamRoster.isLocked()) return { text: "ТУР НАЧАЛСЯ", className: "is-locked-action", data: "", disabled: "disabled" };
    if (teamRoster.isConfirmed()) return { text: "РЕДАКТИРОВАТЬ СОСТАВ", className: "is-edit-action", data: "data-edit-roster", disabled: "" };
    if (!isComplete) return { text: "ИСКАТЬ ИГРОКОВ", className: "is-search-action", data: "data-open-player-panel", disabled: "" };
    const disabled = teamRoster.canConfirmRoster() ? "" : "disabled";
    return { text: "ПОДТВЕРДИТЬ СОСТАВ", className: "is-confirm-action", data: "data-confirm-roster", disabled };
  }
}
