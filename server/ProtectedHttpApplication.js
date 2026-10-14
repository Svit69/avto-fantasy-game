import { ApiAdmissionPolicy } from "./ApiAdmissionPolicy.js";
import { BoundedTaskQueue } from "./BoundedTaskQueue.js";
import { ServerOperationsContext } from "./ServerOperationsContext.js";
import { OperationalSettings as Settings } from "./OperationalSettings.js";
import { HeavyTaskCoordinator } from "./HeavyTaskCoordinator.js";
import { SharedSecretVerifier } from "./SharedSecretVerifier.js";

export class ProtectedHttpApplication {
  constructor(application, dependencies) {
    this.application = application; this.operations = dependencies.operations || new ServerOperationsContext(dependencies);
    this.admission = dependencies.admission || new ApiAdmissionPolicy();
    this.reads = new BoundedTaskQueue(Settings.readNumber("API_READ_CONCURRENCY", 8, 1, 100), Settings.readNumber("API_READ_QUEUE_SIZE", 32, 0, 100));
    this.writes = new BoundedTaskQueue(Settings.readNumber("API_WRITE_CONCURRENCY", 2, 1, 100), Settings.readNumber("API_WRITE_QUEUE_SIZE", 8, 0, 100));
    this.operations.readCapacity = () => ({ admissions: this.admission.readStatus(), reads: this.reads.readStatus(), writes: this.writes.readStatus(), heavyLocal: HeavyTaskCoordinator.getShared().queue.readStatus() });
  }
  startMonitoring() { this.operations.startMonitoring(); }
  stopMonitoring() { this.operations.stopMonitoring(); }
  async handleRequest(request, response) {
    let reservation;
    try {
      const pathname = new URL(request.url, "http://localhost").pathname;
      if (["/api/telegram-webhook-info", "/api/telegram-bot-info"].includes(pathname) && (!process.env.OPERATIONS_MONITOR_TOKEN
        || !new SharedSecretVerifier().matches(request.headers.authorization, `Bearer ${process.env.OPERATIONS_MONITOR_TOKEN}`))) return this.#reject(response, 403, "access_denied");
      if (["/api/ready", "/api/operations"].includes(pathname)) return await this.operations.handleEndpoint(request, response, pathname);
      if (!pathname.startsWith("/api/") || pathname === "/api/health") return await this.application.handleRequest(request, response);
      reservation = this.admission.admitRequest(request, pathname);
      if (reservation.statusCode) return this.#reject(response, reservation.statusCode, reservation.error, reservation.retryAfter);
      this.operations.metrics.measureRequest(request, response, pathname);
      const task = () => response.destroyed ? undefined : this.application.handleRequest(request, response);
      if (pathname === "/api/telegram-webhook") return await task();
      return await (["GET", "HEAD"].includes(request.method) ? this.reads : this.writes).runTask(task);
    } catch (error) {
      if (!response.headersSent && !response.destroyed) this.#reject(response, error.statusCode || 500, error.statusCode ? error.message : "internal_server_error", error.retryAfter);
    } finally { reservation?.release?.(); }
  }
  #reject(response, statusCode, error, retryAfter = 5) {
    response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8", "Retry-After": String(retryAfter), "Cache-Control": "no-store" });
    response.end(JSON.stringify({ error, retryAfter }));
  }
}
