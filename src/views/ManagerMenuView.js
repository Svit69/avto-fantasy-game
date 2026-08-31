export class ManagerMenuView {
  render(profile) {
    return `
      <div class="manager-menu-backdrop" data-close-manager-menu></div>
      <aside class="manager-menu">
        <header>
          <img src="/assets/avto_logo.png" alt="" />
          <button type="button" data-close-manager-menu aria-label="Закрыть">×</button>
        </header>
        <section>
          <span>Имя менеджера</span>
          <strong>${profile.managerName || "Менеджер"}</strong>
        </section>
        <section>
          <span>Место в текущем месяце:</span>
          <strong>${profile.monthlyPlace || "—"}</strong>
        </section>
      </aside>
    `;
  }
}
