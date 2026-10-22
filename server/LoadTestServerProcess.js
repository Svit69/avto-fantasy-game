import { fork } from "node:child_process";
import { once } from "node:events";
import { fileURLToPath } from "node:url";

export class LoadTestServerProcess {
  async start(userCount) {
    this.child = fork(fileURLToPath(new URL("./load-test-server.js", import.meta.url)), [String(userCount)], { stdio: ["ignore", "ignore", "inherit", "ipc"] });
    return this.#waitForMessage("ready");
  }
  async readSample() { const result = this.#waitForMessage("sample"); this.child.send({ type: "sample" }); return result; }
  async stop() {
    if (!this.child || this.child.exitCode !== null || this.child.signalCode !== null) return;
    const exit = once(this.child, "exit");
    if (this.child.connected) this.child.send({ type: "stop" }); else this.child.kill();
    const timer = setTimeout(() => this.child.kill(), 5000);
    try { await exit; } finally { clearTimeout(timer); }
  }
  #waitForMessage(type) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => finish(new Error(`load_test_${type}_timeout`)), 30000);
      const receive = (message) => { if (message.type === type) finish(null, message); };
      const failed = () => finish(new Error("load_test_server_exited"));
      const finish = (error, result) => { clearTimeout(timer); this.child.off("message", receive); this.child.off("exit", failed); this.child.off("error", failed); error ? reject(error) : resolve(result); };
      this.child.on("message", receive); this.child.once("exit", failed); this.child.once("error", failed);
    });
  }
}
