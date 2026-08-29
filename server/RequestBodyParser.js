export class RequestBodyParser {
  readText(request) {
    return new Promise((resolve, reject) => {
      let body = "";
      request.setEncoding("utf8");
      request.on("data", (chunk) => {
        body += chunk;
        if (body.length > 1_000_000) reject(new Error("Request body is too large"));
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
