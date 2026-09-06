import path from "node:path";
import { fileURLToPath } from "node:url";
import { AssetWebpConverter } from "./AssetWebpConverter.js";
import { AssetWebpFileScanner } from "./AssetWebpFileScanner.js";
import { AssetWebpReport } from "./AssetWebpReport.js";

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");
const directories = ["assets", "public/assets"];
const scanner = new AssetWebpFileScanner(rootDirectory);
const converter = new AssetWebpConverter();
const fileGroups = await Promise.all(directories.map((directory) => scanner.listPngFiles(directory)));
const results = await converter.convertFiles(fileGroups.flat(), { force });
console.log(new AssetWebpReport().render(results));
