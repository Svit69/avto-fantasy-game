import path from "node:path";
import { ScheduledNotificationRunner } from "./ScheduledNotificationRunner.js";
import { NotificationWorkerLock } from "./NotificationWorkerLock.js";
import { ServerNotificationFactory } from "./ServerNotificationFactory.js";

export class RosterPriceNotificationScheduler extends ScheduledNotificationRunner {
  constructor({ rootDirectory, botClient, logger, lock, createWorker }) {
    super({ botClient, logger, lock: lock || new NotificationWorkerLock(path.join(rootDirectory, process.env.NOTIFICATION_LOCK_PATH || "storage/notification-worker.lock")),
      createWorker: createWorker || (() => new ServerNotificationFactory(rootDirectory, botClient, logger).createRosterPriceNotificationWorker()),
      eventPrefix: "roster_price_scheduler" });
  }
}
