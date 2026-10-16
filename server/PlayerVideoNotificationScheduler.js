import path from "node:path";
import { NotificationWorkerLock } from "./NotificationWorkerLock.js";
import { ServerNotificationFactory } from "./ServerNotificationFactory.js";
import { ScheduledNotificationRunner } from "./ScheduledNotificationRunner.js";
export class PlayerVideoNotificationScheduler extends ScheduledNotificationRunner {
  constructor({ rootDirectory, botClient, logger, lock, createWorker }) {
    super({ botClient, logger, lock: lock || new NotificationWorkerLock(path.join(rootDirectory, process.env.NOTIFICATION_LOCK_PATH || "storage/notification-worker.lock")),
      createWorker: createWorker || (() => new ServerNotificationFactory(rootDirectory, botClient, logger).createPlayerVideoNotificationWorker()),
      isEnabled: () => process.env.PLAYER_VIDEO_NOTIFICATIONS_ENABLED !== "false", eventPrefix: "player_video_scheduler" });
  }
}
