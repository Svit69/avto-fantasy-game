import fs from "node:fs/promises";
import path from "node:path";
import { VideoNoteNotificationDelivery } from "./VideoNoteNotificationDelivery.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
const directory = process.argv[2];
const bot = { callJson: async () => {
  await fs.appendFile(path.join(directory, "video-events.txt"), "sent\n");
  await new Promise((resolve) => setTimeout(resolve, 50));
  return { ok: true };
} };
const delivery = new VideoNoteNotificationDelivery(bot, { info: () => {}, warn: () => {} }, new RuntimeStateStore(directory));
await delivery.deliver({ userId: "cross-process", key: "one-tour", playerId: "p", videoNote: "file" });
