export class FooterView {
  render(teamRoster) {
    const filledCount = teamRoster.calculateFilledPlayersCount();
    const totalCount = teamRoster.calculateTotalSlotsCount();
    const spentBudget = teamRoster.calculateSelectedPlayersPrice();
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
              <div class="stat-value">${spentBudget}/${teamRoster.getBudgetLimit()}M</div>
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
