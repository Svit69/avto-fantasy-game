export class RosterLimitToastView {
  render(teamName) {
    return `
      <aside class="roster-toast" role="status">
        <img src="${this.#selectTeamLogo(teamName)}" alt="" />
        <p>Выбранно максимум игроков из клуба "${teamName}" (3/3)</p>
        <button type="button" data-close-toast aria-label="Закрыть">×</button>
      </aside>
    `;
  }

  #selectTeamLogo(teamName) {
    return teamName === "Горняк-УГМК" ? "/assets/gornyak_logo.png" : "/assets/avto_logo.png";
  }
}
