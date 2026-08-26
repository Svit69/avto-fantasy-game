export class FooterView {
  render(teamRoster) {
    const filledCount = teamRoster.calculateFilledPlayersCount();
    const totalCount = teamRoster.calculateTotalSlotsCount();

    return `
      <footer class="app-footer">
        <div class="footer-content">
          <div class="footer-stats">
            <div>
              <div class="stat-label">Бюджет</div>
              <div class="stat-value">${teamRoster.getBudgetLimit()}M</div>
            </div>
            <div>
              <div class="stat-label">Игроков заполнено</div>
              <div class="stat-value">${filledCount}/${totalCount}</div>
            </div>
          </div>
          <button class="confirm-button">ПОДТВЕРДИТЬ СОСТАВ</button>
        </div>
      </footer>
    `;
  }
}
