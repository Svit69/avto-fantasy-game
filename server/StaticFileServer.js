import fs from "node:fs/promises";
import path from "node:path";

export class StaticFileServer {
  constructor(rootDirectory) {
    this.rootDirectory = rootDirectory;
    this.allowedRootNames = new Set(["assets", "src", "styles", "public", "index.html"]);
    this.contentTypes = new Map([[".html", "text/html"], [".js", "text/javascript"], [".css", "text/css"],
      [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".svg", "image/svg+xml"],
      [".webp", "image/webp"], [".woff", "font/woff"], [".woff2", "font/woff2"], [".ttf", "font/ttf"]]);
  }

  async serveFile(pathname, response) {
    const filePath = this.#resolvePublicPath(pathname);
    if (!filePath) return this.#sendNotFound(response);
    try {
      const content = await fs.readFile(filePath);
      response.writeHead(200, { "Content-Type": this.#getContentType(filePath), "Cache-Control": "public, max-age=3600" });
      response.end(content);
    } catch {
      this.#sendNotFound(response);
    }
  }

  #resolvePublicPath(pathname) {
    const requestedPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
    if (!this.#isAllowedPublicPath(requestedPath)) return null;
    const filePath = path.normalize(path.join(this.rootDirectory, requestedPath));
    return filePath.startsWith(`${this.rootDirectory}${path.sep}`) ? filePath : null;
  }

  #isAllowedPublicPath(requestedPath) {
    const rootName = requestedPath.split("/").filter(Boolean)[0];
    return this.allowedRootNames.has(rootName);
  }

  #getContentType(filePath) {
    return `${this.contentTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream"}; charset=utf-8`;
  }

  #sendNotFound(response) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}
