import { PostgresDatabase } from "./PostgresDatabase.js";

export class DatabaseReadinessProbe {
  #cached;
  #pending;
  async checkReadiness() {
    if (process.env.STORAGE_DRIVER !== "postgres") return { ok: true, database: "not_configured" };
    if (this.#cached?.expiresAt > Date.now()) return this.#cached.result;
    if (this.#pending) return this.#pending;
    this.#pending = (async () => {
      let result;
      try { await new PostgresDatabase().query("select 1"); result = { ok: true, database: "ready" }; }
      catch { result = { ok: false, database: "unavailable" }; }
      this.#cached = { result, expiresAt: Date.now() + 3000 }; return result;
    })();
    try { return await this.#pending; } finally { this.#pending = null; }
  }
}
