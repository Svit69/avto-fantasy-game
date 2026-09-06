import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { PostgresDatabase } from "./PostgresDatabase.js";
import { PostgresMigrationRunner } from "./PostgresMigrationRunner.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));

const runner = new PostgresMigrationRunner(new PostgresDatabase(), path.join(rootDirectory, "migrations"));
console.log(JSON.stringify(await runner.runMigrations(), null, 2));
process.exit(0);
