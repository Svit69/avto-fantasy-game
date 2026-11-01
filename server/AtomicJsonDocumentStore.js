import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import lockfile from "proper-lockfile";

export class AtomicJsonDocumentStore {
  constructor(filePath) { this.filePath = filePath; }
  async readDocument() {
    try {
      const document = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      if (!document || Array.isArray(document) || typeof document !== "object") throw Error("invalid_json_document");
      return document;
    } catch (error) { if (error.code === "ENOENT") return {}; throw error; }
  }
  async mutateDocument(mutate) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    const release = await lockfile.lock(this.filePath, { realpath: false, stale: 60000,
      retries: { retries: 100, minTimeout: 10, maxTimeout: 100 } });
    const temporary = `${this.filePath}.${crypto.randomUUID()}.tmp`;
    try {
      const document = await this.readDocument(); const result = mutate(document);
      if (result !== null) {
        await fs.writeFile(temporary, JSON.stringify(document), "utf8");
        await fs.rename(temporary, this.filePath);
      }
      return result;
    } finally { try { await fs.rm(temporary, { force: true }); } finally { await release(); } }
  }
}
