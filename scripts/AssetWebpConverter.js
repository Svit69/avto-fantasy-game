import fs from "node:fs/promises";
import sharp from "sharp";
import { AssetWebpConversionPolicy } from "./AssetWebpConversionPolicy.js";

export class AssetWebpConverter {
  constructor(policy = new AssetWebpConversionPolicy()) {
    this.policy = policy;
  }

  async convertFiles(filePaths, { force = false } = {}) {
    const results = [];
    for (const filePath of filePaths) results.push(await this.#convertFile(filePath, force));
    return results;
  }

  async #convertFile(filePath, force) {
    const targetPath = filePath.replace(/\.png$/i, ".webp");
    if (!force && await this.#isFresh(filePath, targetPath)) return { filePath, targetPath, status: "skipped" };
    await sharp(filePath).webp(this.policy.createOptions(filePath)).toFile(targetPath);
    return this.#keepSmallerFile(filePath, targetPath);
  }

  async #keepSmallerFile(filePath, targetPath) {
    const [source, target] = await Promise.all([fs.stat(filePath), fs.stat(targetPath)]);
    if (this.policy.shouldKeepConvertedFile(source.size, target.size)) return { filePath, targetPath, status: "converted", sourceSize: source.size, targetSize: target.size };
    await fs.rm(targetPath, { force: true });
    return { filePath, targetPath, status: "larger_removed", sourceSize: source.size, targetSize: target.size };
  }

  async #isFresh(filePath, targetPath) {
    try {
      const [source, target] = await Promise.all([fs.stat(filePath), fs.stat(targetPath)]);
      return target.mtimeMs >= source.mtimeMs;
    } catch {
      return false;
    }
  }
}
