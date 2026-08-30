export class RosterSubmissionApiClient {
  async submitConfirmedRoster(slots) {
    const initData = window.Telegram?.WebApp?.initData || "";
    const response = await fetch("/api/roster", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ initData, slots }),
    });

    if (!response.ok) throw new Error("roster_submit_failed");
    return response.json();
  }
}
