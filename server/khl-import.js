import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "./EnvironmentFileLoader.js";
import { KhlFixtureImporter } from "./KhlFixtureImporter.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
const sourcePath = process.argv[2];
if (!sourcePath) throw new Error("Usage: npm run khl:import -- path/to/file.har");
const fixtureRoot = path.join(rootDirectory, process.env.KHL_FIXTURE_PATH || "storage/khl-fixtures");
console.log(JSON.stringify(await new KhlFixtureImporter(fixtureRoot).importSource(path.resolve(sourcePath)), null, 2));
