export class FooterView {
  render(teamRoster) {
    const filledCount = teamRoster.calculateFilledPlayersCount();
    const totalCount = teamRoster.calculateTotalSlotsCount();
    const spentBudget = teamRoster.calculateSelectedPlayersPrice();
    const budgetLimit = teamRoster.getBudgetLimit();
    const remainingBudget = budgetLimit - spentBudget;
    const budgetState = remainingBudget < 0 ? "is-over-budget" : "";
    const isComplete = filledCount === totalCount;
    const actionText = isComplete ? "ПОДТВЕРДИТЬ СОСТАВ" : "ИСКАТЬ ИГРОКОВ";
    const actionClass = isComplete ? "is-confirm-action" : "is-search-action";
    const actionData = isComplete ? "" : "data-open-player-panel";
    const disabled = isComplete && !teamRoster.canConfirmRoster() ? "disabled" : "";

    return `
      <footer class="app-footer">
        <div class="footer-content">
          <div class="footer-stats">
            <div>
              <div class="stat-label">Бюджет</div>
              <div class="budget-value ${budgetState}"><b>${remainingBudget}к</b><span>из ${budgetLimit}к</span></div>
            </div>
            <div>
              <div class="stat-label">Игроков заполнено</div>
              <div class="stat-value">${filledCount}/${totalCount}</div>
            </div>
          </div>
          <button class="confirm-button ${actionClass}" type="button" ${actionData} ${disabled}>${actionText}</button>
        </div>
      </footer>
    `;
  }
}
