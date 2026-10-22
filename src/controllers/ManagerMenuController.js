import { TelegramManagerProfileService } from "../services/TelegramManagerProfileService.js";
import { ManagerMenuView } from "../views/ManagerMenuView.js";

export class ManagerMenuController {
  #requestVersion = 0;
  constructor(rootElement, getSelectedMonth = () => "Сентябрь", profileService = new TelegramManagerProfileService()) {
    this.rootElement = rootElement;
    this.getSelectedMonth = getSelectedMonth;
    this.profileService = profileService;
    this.menuView = new ManagerMenuView();
  }

  connectManagerMenuActions() {
    this.rootElement.addEventListener("click", (event) => this.#handleMenuAction(event));
  }

  async #handleMenuAction(event) {
    if (event.target.closest("[data-open-manager-menu]")) return this.#openManagerMenu();
    if (event.target.closest("[data-close-manager-menu]")) return this.#closeManagerMenu();
  }

  async #openManagerMenu() {
    const root = this.rootElement.querySelector("[data-manager-menu-root]");
    const version = ++this.#requestVersion; const month = this.getSelectedMonth();
    root.innerHTML = this.menuView.render(this.profileService.loadCachedProfile());
    try {
      const profile = await this.profileService.loadManagerProfile(month);
      if (version !== this.#requestVersion || month !== this.getSelectedMonth()) return;
      const name = root.querySelector("[data-manager-name]"); const place = root.querySelector("[data-manager-place]");
      if (name) name.textContent = profile.managerName || "Менеджер";
      if (place) place.textContent = profile.monthlyPlace || "—";
    } catch { /* Cached profile remains available while the connection is unavailable. */ }
  }

  #closeManagerMenu() {
    this.#requestVersion += 1;
    this.rootElement.querySelector("[data-manager-menu-root]").innerHTML = "";
  }
}
