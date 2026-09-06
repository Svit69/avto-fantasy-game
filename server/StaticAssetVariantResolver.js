import fs from "node:fs/promises";
import path from "node:path";

export class StaticAssetVariantResolver {
  constructor(rootDirectory) {
    this.rootDirectory = rootDirectory;
  }

  async resolveAssetPath(requestedPath) {
    if (!requestedPath.startsWith("/assets/")) return null;
    for (const candidate of this.#createAssetCandidates(requestedPath)) {
      if (await this.#fileExists(candidate)) return candidate;
    }
    return null;
  }

  #createAssetCandidates(requestedPath) {
    const paths = [`/public${requestedPath}`, requestedPath].map((pathVariant) => this.#resolveRootPath(pathVariant)).filter(Boolean);
    return [...paths.map((filePath) => this.#createWebpCandidate(filePath)).filter(Boolean), ...paths];
  }

  #createWebpCandidate(filePath) {
    if (path.extname(filePath).toLowerCase() !== ".png") return null;
    return filePath.replace(/\.png$/i, ".webp");
  }

  #resolveRootPath(requestedPath) {
    const filePath = path.normalize(path.join(this.rootDirectory, requestedPath));
    return filePath.startsWith(`${this.rootDirectory}${path.sep}`) ? filePath : null;
  }

  async #fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
