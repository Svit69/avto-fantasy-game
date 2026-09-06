import { RequestAuthorizationHeaderFactory } from "./RequestAuthorizationHeaderFactory.js";

export class RosterSubmissionApiClient {
  constructor(headerFactory = new RequestAuthorizationHeaderFactory()) { this.headerFactory = headerFactory; }

  async loadSavedRoster(month) {
    const response = await fetch(`/api/roster?month=${encodeURIComponent(month)}`, {
      headers: this.headerFactory.createAuthorizationHeaders(),
    });

    if (!response.ok) return null;
    return (await response.json()).roster || null;
  }

  async submitConfirmedRoster(slots, month) {
    const body = JSON.stringify({ initData: window.Telegram?.WebApp?.initData || "", month, slots });
    const response = await fetch("/api/roster", {
      method: "POST", headers: this.headerFactory.createJsonHeaders(), body,
    });

    if (!response.ok) throw new Error("roster_submit_failed");
    return response.json();
  }
}
