import { RosterLimitToastView } from "../views/RosterLimitToastView.js";

export class RosterLimitToastController {
  #timer = null;

  constructor(rootElement) {
    this.rootElement = rootElement;
    this.toastView = new RosterLimitToastView();
  }

  showClubLimitNotification(teamName) {
    this.closeNotification();
    this.rootElement.insertAdjacentHTML("beforeend", this.toastView.render(teamName));
    this.#timer = setTimeout(() => this.closeNotification(), 3200);
  }

  closeNotification() {
    clearTimeout(this.#timer);
    this.rootElement.querySelector(".roster-toast")?.remove();
  }
}
