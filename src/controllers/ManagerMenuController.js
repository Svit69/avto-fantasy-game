import { TelegramManagerProfileService } from "../services/TelegramManagerProfileService.js";
import { ManagerMenuView } from "../views/ManagerMenuView.js";

export class ManagerMenuController {
  constructor(rootElement) {
    this.rootElement = rootElement;
    this.profileService = new TelegramManagerProfileService();
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
    root.innerHTML = this.menuView.render(await this.profileService.loadManagerProfile());
  }

  #closeManagerMenu() {
    this.rootElement.querySelector("[data-manager-menu-root]").innerHTML = "";
  }
}
