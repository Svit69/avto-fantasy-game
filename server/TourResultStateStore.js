import crypto from "node:crypto";
import { RuntimeStateStore } from "./RuntimeStateStore.js";
export class TourResultStateStore {
  constructor(store = new RuntimeStateStore()) { this.store = store; }
  async readActivationTime(now) {
    const saved = await this.store.readState("tour-results-activation.json");
    if (Number.isFinite(saved?.activatedAt)) return saved.activatedAt;
    await this.store.writeState("tour-results-activation.json", { activatedAt: now });
    return now;
  }
  #name(tourId) { return `tour-result-${crypto.createHash("sha256").update(String(tourId)).digest("hex")}.json`; }
  readTourState(tourId) { return this.store.readState(this.#name(tourId)); }
  writeTourState(tourId, state) { return this.store.writeState(this.#name(tourId), state); }
}
