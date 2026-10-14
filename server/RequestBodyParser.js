import { ServiceCapacityError } from "./ServiceCapacityError.js";
import { OperationalSettings as Settings } from "./OperationalSettings.js";

export class RequestBodyParser {
  constructor(maxBytes = Settings.readNumber("API_BODY_MAX_BYTES", 65536)) { this.maxBytes = maxBytes; }
  readText(request, maxBytes = this.maxBytes) {
    return new Promise((resolve, reject) => {
      let chunks = []; let size = 0; let timer;
      const cleanup = () => {
        clearTimeout(timer); request.off("data", receiveChunk); request.off("end", finish);
        request.off("error", fail); request.off("aborted", abort);
      };
      const fail = (error) => { cleanup(); chunks = []; request.once("error", () => {}); request.resume(); reject(error); };
      const abort = () => fail(new ServiceCapacityError("request_aborted", 400));
      const resetTimer = () => { clearTimeout(timer); timer = setTimeout(() => fail(new ServiceCapacityError("request_body_timeout", 408)), Settings.readNumber("REQUEST_BODY_IDLE_MS", 30000)); timer.unref?.(); };
      const receiveChunk = (chunk) => {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        size += bytes.length;
        if (size > maxBytes) return fail(new ServiceCapacityError("payload_too_large", 413));
        chunks.push(bytes); resetTimer();
      };
      const finish = () => { cleanup(); resolve(Buffer.concat(chunks, size).toString("utf8")); chunks = []; };
      if (Number(request.headers?.["content-length"] || 0) > maxBytes) return fail(new ServiceCapacityError("payload_too_large", 413));
      request.on("data", receiveChunk); request.once("end", finish); request.once("error", fail); request.once("aborted", abort); resetTimer();
    });
  }
  async readJson(request, maxBytes = this.maxBytes) {
    const text = await this.readText(request, maxBytes);
    return text ? JSON.parse(text) : {};
  }
}
