import fs from "node:fs/promises";
import path from "node:path";

export class PostgresMigrationRunner {
  constructor(database, migrationsDirectory) { Object.assign(this, { database, migrationsDirectory }); }

  async runMigrations() {
    await this.#ensureMigrationTable();
    const files = await this.#listMigrationFiles();
    for (const fileName of files) await this.#runMigration(fileName);
    return { ok: true, migrations: files.length };
  }

  async #runMigration(fileName) {
    const applied = await this.#isApplied(fileName);
    if (applied) return;
    const sql = await fs.readFile(path.join(this.migrationsDirectory, fileName), "utf8");
    await this.database.transaction(async (client) => {
      await client.query(sql);
      await client.query("insert into schema_migrations (name) values ($1)", [fileName]);
    });
  }

  async #ensureMigrationTable() {
    await this.database.query("create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())");
  }

  async #isApplied(fileName) {
    const result = await this.database.query("select 1 from schema_migrations where name=$1", [fileName]);
    return Boolean(result.rows[0]);
  }

  async #listMigrationFiles() {
    return (await fs.readdir(this.migrationsDirectory)).filter((file) => file.endsWith(".sql")).sort();
  }
}
