export class SelectionDrawerFooterView {
  render(teamRoster) {
    const filled = teamRoster.calculateFilledPlayersCount();
    const total = teamRoster.calculateTotalSlotsCount();
    const remainingBudget = teamRoster.getBudgetLimit() - teamRoster.calculateSelectedPlayersPrice();
    const budgetClassName = remainingBudget < 0 ? "is-over-budget" : "";
    return `
      <footer class="selection-drawer-footer">
        <div>
          <span>Бюджет</span>
          <strong class="${budgetClassName}">${remainingBudget}к</strong>
        </div>
        <div>
          <span>Игроков заполнено</span>
          <strong>${filled}/${total}</strong>
        </div>
      </footer>
    `;
  }
}
