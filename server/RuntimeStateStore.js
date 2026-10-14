import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

export class RuntimeStateStore {
  constructor(directory = process.env.RUNTIME_STATE_DIRECTORY || fileURLToPath(new URL("../storage/runtime/", import.meta.url))) { this.directory = directory; }
  resolveFile(name) { return path.join(this.directory, name); }
  async readState(name) {
    try { return JSON.parse(await fs.readFile(this.resolveFile(name), "utf8")); }
    catch (error) { if (error.code === "ENOENT") return null; throw error; }
  }
  async writeState(name, value) {
    await fs.mkdir(this.directory, { recursive: true });
    const target = this.resolveFile(name); const temporary = `${target}.${process.pid}.${crypto.randomUUID()}.tmp`;
    try { await fs.writeFile(temporary, JSON.stringify(value), "utf8"); await fs.rename(temporary, target); }
    finally { await fs.rm(temporary, { force: true }); }
  }
}
