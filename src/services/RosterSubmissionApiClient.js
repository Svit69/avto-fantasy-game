import { RequestAuthorizationHeaderFactory } from "./RequestAuthorizationHeaderFactory.js";
import { CapacityAwareApiRequest } from "./CapacityAwareApiRequest.js";

export class RosterSubmissionApiClient {
  constructor(headerFactory = new RequestAuthorizationHeaderFactory()) { this.headerFactory = headerFactory; }

  async loadSavedRoster(month) {
    const response = await new CapacityAwareApiRequest().fetchResponse(`/api/roster?month=${encodeURIComponent(month)}`, {
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

    if (!response.ok) {
      const details = await response.json().catch(() => ({}));
      throw Object.assign(new Error(details.error || "roster_submit_failed"), { statusCode: response.status, retryAfter: Number(response.headers.get("Retry-After")) || 5 });
    }
    return response.json();
  }
}
