import { TourResultSnapshotService } from "./TourResultSnapshotService.js";
import { TourResultMessageFactory } from "./TourResultMessageFactory.js";
import { AuthorizedTelegramAppUrlFactory } from "./AuthorizedTelegramAppUrlFactory.js";
import { WebLoginTokenService } from "./WebLoginTokenService.js";
export class TourResultNotificationPlanner {
  constructor({ service, messageFactory = new TourResultMessageFactory(), adminIds = (process.env.TELEGRAM_ADMIN_IDS || "").split(","), ...repositories }) {
    Object.assign(this, { service: service || new TourResultSnapshotService(repositories), messageFactory, adminIds });
  }
  async createNotificationJobs(calendar, users, now = Date.now()) {
    if (process.env.TOUR_RESULTS_NOTIFICATIONS_ENABLED === "false") return [];
    const activatedAt = await this.service.stateStore.readActivationTime(now);
    const jobs = [];
    for (const tour of calendar.tours || []) {
      const end = Date.parse(tour.endsAt);
      if (!Number.isFinite(end) || end < activatedAt || end > now) continue;
      const result = await this.service.readFinalResult(tour, calendar, users, now);
      if (result.phase === "awaiting_data" && now - end >= 21600000) {
        jobs.push(...this.#adminJobs(tour.id, [this.messageFactory.createPendingMessage(tour, result.missing)], "pending"));
      }
      if (result.phase !== "final") continue;
      for (const winner of result.leaders.filter((entry) => entry.place === 1)) {
        const user = users.find((item) => String(item.id) === String(winner.userId) && item.status !== "blocked");
        if (!user) continue;
        const url = new AuthorizedTelegramAppUrlFactory(new WebLoginTokenService(process.env.TELEGRAM_BOT_TOKEN))
          .createAuthorizedAppUrl(process.env.TELEGRAM_WEB_APP_URL || "http://localhost:3000", user);
        jobs.push({ userId: winner.userId, key: `tour-result:${tour.id}:winner`, text: this.messageFactory.createWinnerMessage(result, winner), parseMode: "HTML", verifyTelegramResult: true,
          replyMarkup: { inline_keyboard: [[{ text: "Открыть приложение", web_app: { url } }]] } });
      }
      jobs.push(...this.#adminJobs(tour.id, this.messageFactory.createAdminMessages(result), "top3"));
    }
    return jobs;
  }
  #adminJobs(tourId, messages, kind) {
    const ids = [...new Set(this.adminIds.map((id) => String(id).trim()).filter((id) => /^\d+$/.test(id)))];
    return ids.flatMap((userId) => messages.map((text, index) => ({ userId, key: `tour-result:${tourId}:admin:${kind}:${index}`, text, parseMode: "HTML", verifyTelegramResult: true })));
  }
}
