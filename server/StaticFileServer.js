import fs from "node:fs/promises";
import path from "node:path";
import { StaticPathResolver } from "./StaticPathResolver.js";

export class StaticFileServer {
  constructor(rootDirectory) {
    this.pathResolver = new StaticPathResolver(rootDirectory);
    this.contentTypes = new Map([[".html", "text/html"], [".js", "text/javascript"], [".css", "text/css"],
      [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"], [".svg", "image/svg+xml"],
      [".webp", "image/webp"], [".woff", "font/woff"], [".woff2", "font/woff2"], [".ttf", "font/ttf"]]);
  }

  async serveFile(pathname, response) {
    const filePath = await this.pathResolver.resolveFilePath(pathname);
    if (!filePath) return this.#sendNotFound(response);
    try {
      const content = await fs.readFile(filePath);
      response.writeHead(200, { "Content-Type": this.#getContentType(filePath), "Cache-Control": this.#getCacheControl(filePath) });
      response.end(content);
    } catch {
      this.#sendNotFound(response);
    }
  }

  #getContentType(filePath) {
    return `${this.contentTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream"}; charset=utf-8`;
  }

  #getCacheControl(filePath) {
    const extension = path.extname(filePath).toLowerCase();
    return [".html", ".js"].includes(extension) ? "no-store" : "no-cache, must-revalidate";
  }

  #sendNotFound(response) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
    response.end("Not found");
  }
}
