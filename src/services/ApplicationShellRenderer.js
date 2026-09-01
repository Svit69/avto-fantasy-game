import { AppShellView } from "../views/AppShellView.js";
import { HeaderView } from "../views/HeaderView.js";

export class ApplicationShellRenderer {
  renderApplicationShell(rootElement) {
    rootElement.innerHTML = new AppShellView(new HeaderView()).render();
    const logoElement = rootElement.querySelector("[data-logo]");
    logoElement?.addEventListener("error", () => this.#renderLogoFallback(logoElement));
  }

  #renderLogoFallback(logoElement) {
    logoElement.outerHTML = `<div class="brand-fallback" role="img" aria-label="Логотип Автомобилиста"></div>`;
  }
}
