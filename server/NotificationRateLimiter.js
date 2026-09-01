export class NotificationRateLimiter {
  constructor(messagesPerSecond = 20) {
    this.delayMs = Math.max(1, Math.ceil(1000 / Math.max(1, messagesPerSecond)));
    this.nextAllowedAt = 0;
  }

  async waitForNextDeliverySlot() {
    const waitMs = Math.max(0, this.nextAllowedAt - Date.now());
    if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));
    this.nextAllowedAt = Date.now() + this.delayMs;
  }
}
