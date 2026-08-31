import fs from "node:fs/promises";
import path from "node:path";

export class StaticPathResolver {
  constructor(rootDirectory) {
    this.rootDirectory = rootDirectory;
    this.allowedRootNames = new Set(["assets", "src", "styles", "public", "index.html"]);
  }

  async resolveFilePath(pathname) {
    const requestedPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
    if (!this.#isAllowedPublicPath(requestedPath)) return null;
    const preferredAssetPath = await this.#resolvePreferredAssetPath(requestedPath);
    return preferredAssetPath || this.#resolveRootPath(requestedPath);
  }

  async #resolvePreferredAssetPath(requestedPath) {
    if (!requestedPath.startsWith("/assets/")) return null;
    const publicAssetPath = this.#resolveRootPath(`/public${requestedPath}`);
    return await this.#fileExists(publicAssetPath) ? publicAssetPath : null;
  }

  #resolveRootPath(requestedPath) {
    const filePath = path.normalize(path.join(this.rootDirectory, requestedPath));
    return filePath.startsWith(`${this.rootDirectory}${path.sep}`) ? filePath : null;
  }

  #isAllowedPublicPath(requestedPath) {
    const rootName = requestedPath.split("/").filter(Boolean)[0];
    return this.allowedRootNames.has(rootName);
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
