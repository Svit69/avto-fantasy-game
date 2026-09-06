import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { JsonStorageReader } from "./JsonStorageReader.js";
import { JsonToPostgresImporter } from "./JsonToPostgresImporter.js";
import { PostgresDatabase } from "./PostgresDatabase.js";
import { StorageDriverFactory } from "./StorageDriverFactory.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
process.env.STORAGE_DRIVER = "postgres";

const resolveStoragePath = (filePath) => path.join(rootDirectory, filePath);
const storageFactory = new StorageDriverFactory(resolveStoragePath, new PostgresDatabase());
const importer = new JsonToPostgresImporter(storageFactory, new JsonStorageReader(resolveStoragePath));
console.log(JSON.stringify(await importer.importAll(), null, 2));
process.exit(0);
