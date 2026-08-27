export class FooterView {
  render(teamRoster) {
    const filledCount = teamRoster.calculateFilledPlayersCount();
    const totalCount = teamRoster.calculateTotalSlotsCount();
    const spentBudget = teamRoster.calculateSelectedPlayersPrice();
    const confirmDisabled = teamRoster.canConfirmRoster() ? "" : "disabled";

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
          <button class="confirm-button" ${confirmDisabled}>ПОДТВЕРДИТЬ СОСТАВ</button>
        </div>
      </footer>
    `;
  }
}
