import fs from "node:fs/promises";
import path from "node:path";

export class AssetWebpFileScanner {
  constructor(rootDirectory) {
    this.rootDirectory = rootDirectory;
  }

  async listPngFiles(directory = "assets") {
    return this.#collectPngFiles(path.join(this.rootDirectory, directory));
  }

  async #collectPngFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.map((entry) => this.#collectEntry(directory, entry)));
    return nested.flat().sort();
  }

  async #collectEntry(directory, entry) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) return this.#collectPngFiles(filePath);
    return entry.isFile() && entry.name.toLowerCase().endsWith(".png") ? [filePath] : [];
  }
}
