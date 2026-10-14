import pg from "pg";
import { PostgresPoolSettings } from "./PostgresPoolSettings.js";

export class PostgresDatabase {
  static #pool = null;
  static readPoolStatus() { return this.#pool ? { total: this.#pool.totalCount, idle: this.#pool.idleCount, waiting: this.#pool.waitingCount } : null; }

  constructor(connectionString = process.env.DATABASE_URL) {
    if (!connectionString) throw new Error("DATABASE_URL is required for postgres storage");
    if (!PostgresDatabase.#pool) {
      PostgresDatabase.#pool = new pg.Pool(new PostgresPoolSettings().createOptions(connectionString));
      PostgresDatabase.#pool.on("error", (error) => console.error("postgres_idle_connection_failed", error.message));
    }
    this.pool = PostgresDatabase.#pool;
  }

  query(sql, params = []) { return this.pool.query(sql, params); }

  async transaction(work) {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}
