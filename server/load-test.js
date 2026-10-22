import { LoadTestOptions } from "./LoadTestOptions.js";
import { LoadTestServerProcess } from "./LoadTestServerProcess.js";
import { VirtualUserLoadRunner } from "./VirtualUserLoadRunner.js";

const options = new LoadTestOptions().parseArguments(process.argv.slice(2));
console.log(JSON.stringify({ mode: "isolated-local-json", note: "Synthetic users; no production data, Telegram messages or external targets. Latency is localhost HTTP, not Telegram network latency.", options }));
for (const users of options.users) {
  const serverProcess = new LoadTestServerProcess();
  try {
    const server = await serverProcess.start(users);
    const result = await new VirtualUserLoadRunner().runSessions(server, options);
    const resources = await serverProcess.readSample();
    console.log(JSON.stringify({ users, players: server.players, matches: server.matches, ...result, resources }, null, 2));
  } finally { await serverProcess.stop(); }
}
