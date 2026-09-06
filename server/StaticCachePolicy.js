import path from "node:path";

export class StaticCachePolicy {
  constructor() {
    this.assetExtensions = new Set([".png", ".jpg", ".jpeg", ".svg", ".webp", ".woff", ".woff2", ".ttf"]);
  }

  createCacheControl(filePath, requestedPath = "") {
    const extension = path.extname(filePath).toLowerCase();
    if ([".html", ".js", ".css"].includes(extension)) return "no-store";
    if (this.assetExtensions.has(extension)) return this.#createAssetCacheControl(requestedPath);
    return "no-cache, must-revalidate";
  }

  #createAssetCacheControl(requestedPath) {
    return requestedPath.includes("?v=") ? "public, max-age=31536000, immutable" : "public, max-age=86400";
  }
}
