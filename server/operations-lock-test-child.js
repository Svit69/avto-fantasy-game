import fs from "node:fs/promises";
import path from "node:path";
import { HeavyTaskCoordinator } from "./HeavyTaskCoordinator.js";
import { RuntimeStateStore } from "./RuntimeStateStore.js";

const directory = process.argv[2];
await new HeavyTaskCoordinator(new RuntimeStateStore(directory)).runTask(async () => {
  const events = path.join(directory, "events.txt");
  await fs.appendFile(events, `${process.pid}:start\n`);
  await new Promise((resolve) => setTimeout(resolve, 100));
  await fs.appendFile(events, `${process.pid}:end\n`);
});
