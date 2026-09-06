import pg from "pg";

export class PostgresDatabase {
  static #pool = null;

  constructor(connectionString = process.env.DATABASE_URL) {
    if (!connectionString) throw new Error("DATABASE_URL is required for postgres storage");
    if (!PostgresDatabase.#pool) PostgresDatabase.#pool = new pg.Pool({ connectionString });
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
