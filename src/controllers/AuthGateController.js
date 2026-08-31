import { TelegramAuthorizationService } from "../services/TelegramAuthorizationService.js";
import { AuthRequiredModalView } from "../views/AuthRequiredModalView.js";

export class AuthGateController {
  constructor(rootElement, authService = new TelegramAuthorizationService(), modalView = new AuthRequiredModalView()) {
    Object.assign(this, { rootElement, authService, modalView });
  }

  async verifyApplicationAuthorization() {
    const status = await this.authService.verifyAuthorization();
    if (!status.authorized) this.#showAuthorizationModal();
    return status;
  }

  #showAuthorizationModal() {
    const root = this.rootElement.querySelector("[data-auth-root]");
    if (root) root.innerHTML = this.modalView.render();
  }
}
