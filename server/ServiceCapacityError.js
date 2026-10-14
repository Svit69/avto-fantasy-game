export class ServiceCapacityError extends Error {
  constructor(message = "server_busy", statusCode = 503, retryAfter = 5) {
    super(message); Object.assign(this, { statusCode, retryAfter });
  }
}
