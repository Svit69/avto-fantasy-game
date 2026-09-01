export class DeadlineCountdownController {
  constructor(rootElement) { this.rootElement = rootElement; this.intervalId = null; }

  connectCountdownUpdates() {
    this.#renderCountdowns();
    this.intervalId = window.setInterval(() => this.#renderCountdowns(), 1000);
  }

  #renderCountdowns() {
    this.rootElement.querySelectorAll("[data-deadline-countdown]").forEach((element) => {
      const deadlineTime = Date.parse(element.dataset.deadlineAt);
      const remainingTime = deadlineTime - Date.now();
      if (!Number.isFinite(deadlineTime) || remainingTime <= 0) return element.remove();
      element.querySelector("[data-countdown-value]").innerHTML = this.#formatRemainingTime(remainingTime);
    });
  }

  #formatRemainingTime(remainingTime) {
    const totalMinutes = Math.max(0, Math.floor(remainingTime / 60000));
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    return [days, hours, minutes].map((value) => `<b>${String(value).padStart(2, "0")}</b>`).join("");
  }
}
