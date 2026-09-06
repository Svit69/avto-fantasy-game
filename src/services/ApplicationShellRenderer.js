import { AppShellView } from "../views/AppShellView.js";
import { HeaderView } from "../views/HeaderView.js";
import { LoadingScreenController } from "../controllers/LoadingScreenController.js";

export class ApplicationShellRenderer {
  renderApplicationShell(rootElement) {
    rootElement.innerHTML = new AppShellView(new HeaderView()).render();
    this.loadingController = new LoadingScreenController(rootElement);
    this.loadingController.startLoadingProgress();
    const logoElement = rootElement.querySelector("[data-logo]");
    logoElement?.addEventListener("error", () => this.#renderLogoFallback(logoElement));
  }

  completeLoading() { this.loadingController?.completeLoadingProgress(); }

  #renderLogoFallback(logoElement) {
    logoElement.outerHTML = `<div class="brand-fallback" role="img" aria-label="Логотип Автомобилиста"></div>`;
  }
}
