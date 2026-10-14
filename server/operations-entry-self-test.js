import assert from "node:assert/strict";
import net from "node:net";
import { once } from "node:events";
import { spawn } from "node:child_process";
import sharp from "sharp";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";

const workspace = await createOperationsTestWorkspace();
const reservation = net.createServer(); reservation.listen(0, "127.0.0.1"); await once(reservation, "listening");
const port = reservation.address().port; await new Promise((resolve) => reservation.close(resolve));
const child = spawn(process.execPath, ["server/server.js"], { windowsHide: true, stdio: ["ignore", "pipe", "pipe"], env: { ...process.env,
  HOST: "127.0.0.1", PORT: String(port), STORAGE_DRIVER: "json", TELEGRAM_BOT_TOKEN: "capacity-entry-test", TELEGRAM_ADMIN_IDS: "0",
  TELEGRAM_WEBHOOK_SECRET: "hook-test", OPERATIONS_MONITOR_TOKEN: "ops-test", OPERATIONS_MONITOR_ENABLED: "false", RUNTIME_STATE_DIRECTORY: workspace.directory } });
let output = ""; child.stdout.on("data", (data) => { output += data; }); child.stderr.on("data", (data) => { output += data; });
try {
  const origin = `http://127.0.0.1:${port}`; let ready = false;
  for (let attempt = 0; attempt < 50; attempt += 1) {
    if (child.exitCode !== null) throw new Error(output);
    try { ready = (await fetch(`${origin}/api/health`)).ok; } catch {}
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  assert(ready, output);
  assert((await (await fetch(`${origin}/api/ready`)).json()).ok);
  const script = await fetch(`${origin}/src/services/CapacityAwareApiRequest.js`);
  assert.equal(script.status, 200); assert((await script.text()).includes("class CapacityAwareApiRequest"));
  const image = await fetch(`${origin}/assets/avto_logo.png`);
  assert.equal(image.status, 200); assert((await sharp(Buffer.from(await image.arrayBuffer())).metadata()).width > 0);
} finally {
  if (child.exitCode === null) { const exited = once(child, "exit"); child.kill(); await exited; }
  await workspace.close();
}
console.log("Operations real server entry and streaming assets self-test passed");
