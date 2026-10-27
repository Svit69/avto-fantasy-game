import { ApplicationLoadErrorView } from "../views/ApplicationLoadErrorView.js";
export class LoadingScreenController {
  constructor(rootElement) {
    Object.assign(this, { rootElement, progress: 0, timerId: null });
  }

  startLoadingProgress() {
    this.#updateProgress(8);
    this.timerId = window.setInterval(() => this.#updateProgress(Math.min(this.progress + this.#createStep(), 92)), 180);
  }

  completeLoadingProgress() {
    window.clearInterval(this.timerId);
    this.#updateProgress(100);
    window.setTimeout(() => this.rootElement.querySelector("[data-loading-screen]")?.classList.add("is-hidden"), 180);
  }
  failLoadingProgress() {
    window.clearInterval(this.timerId);
    const screen = this.rootElement.querySelector("[data-loading-screen]");
    if (!screen) return;
    screen.classList.remove("is-hidden"); screen.innerHTML = new ApplicationLoadErrorView().render();
    screen.querySelector("[data-retry-application]").onclick = () => window.location.reload();
  }

  #createStep() {
    return this.progress < 55 ? 7 : 3;
  }

  #updateProgress(value) {
    this.progress = value;
    const root = this.rootElement;
    const progressValue = root.querySelector("[data-loading-progress-value]");
    const progressBar = root.querySelector("[data-loading-progress-bar]");
    if (progressValue) progressValue.textContent = `${Math.round(value)}%`;
    if (progressBar) progressBar.style.width = `${Math.round(value)}%`;
  }
}
