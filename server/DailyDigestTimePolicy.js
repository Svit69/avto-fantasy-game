export class DailyDigestTimePolicy {
  constructor(hour = 9, windowMs = 65 * 60 * 1000) {
    Object.assign(this, { hour, windowMs });
  }

  createDueWindow(now = Date.now()) {
    const local = new Date(now + 3 * 60 * 60 * 1000);
    const target = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), this.hour - 3);
    if (now < target || now - target > this.windowMs) return null;
    return { notificationDate: this.#formatDate(target), matchDate: this.#formatDate(target - 24 * 60 * 60 * 1000) };
  }

  #formatDate(timestamp) {
    return new Date(timestamp + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
  }
}
