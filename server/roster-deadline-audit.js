import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";
import { RosterDeadlineAuditService } from "./RosterDeadlineAuditService.js";

const root = fileURLToPath(new URL("../", import.meta.url));
new EnvironmentFileLoader().loadEnvironmentFile(path.join(root, ".env"));
const storage = new StorageDriverFactory((file) => path.join(root, file));
try {
  const service = new RosterDeadlineAuditService(storage.createCalendarRepository(), storage.createRosterRepository());
  console.log(JSON.stringify(await service.createAuditReport(process.argv[2] || "Ноябрь"), null, 2));
} finally { await storage.database?.pool.end(); }
