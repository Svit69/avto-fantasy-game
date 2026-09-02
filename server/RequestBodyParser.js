export class RequestBodyParser {
  constructor(maxBytes = 8_000_000) { this.maxBytes = maxBytes; }

  readText(request) {
    return new Promise((resolve, reject) => {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => {
        body += chunk;
        if (body.length > this.maxBytes) reject(new Error("Request body is too large"));
      });
      request.on("end", () => resolve(body));
      request.on("error", reject);
    });
  }

  async readJson(request) {
    const text = await this.readText(request);
    return text ? JSON.parse(text) : {};
  }
}
