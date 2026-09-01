export class RosterSubmissionApiClient {
  async loadSavedRoster(month) {
    const response = await fetch(`/api/roster?month=${encodeURIComponent(month)}`, {
      headers: { "x-telegram-init-data": this.#getTelegramInitData() },
    });

    if (!response.ok) return null;
    return (await response.json()).roster || null;
  }

  async submitConfirmedRoster(slots, month) {
    const body = JSON.stringify({ initData: this.#getTelegramInitData(), month, slots });
    const response = await fetch("/api/roster", {
      method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body,
    });

    if (!response.ok) throw new Error("roster_submit_failed");
    return response.json();
  }

  #getTelegramInitData() { return window.Telegram?.WebApp?.initData || ""; }
}
