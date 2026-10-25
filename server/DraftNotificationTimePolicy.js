export class DraftNotificationTimePolicy {
  isInsideReminderWindow(deadlineAt, hours, now, windowMs) {
    const deadline = Date.parse(deadlineAt); const target = deadline - hours * 3600000;
    return Number.isFinite(target) && now < deadline && target <= now && now - target <= windowMs;
  }
  isRecentlyReached(deadlineAt, now, windowMs) {
    const deadline = Date.parse(deadlineAt);
    return Number.isFinite(deadline) && deadline <= now && now - deadline <= windowMs;
  }
}
