import path from "node:path";
import { fileURLToPath } from "node:url";
import { AtomicJsonDocumentStore } from "./AtomicJsonDocumentStore.js";

export class VhlMatchReviewRepository {
  constructor(store = new AtomicJsonDocumentStore(path.join(process.env.RUNTIME_STATE_DIRECTORY ||
    fileURLToPath(new URL("../storage/runtime/", import.meta.url)), "vhl-match-reviews.json")), now = () => Date.now()) {
    Object.assign(this, { store, now });
  }
  async listReviews() { return Object.values(await this.store.readDocument()); }
  async findReview(id) { return (await this.store.readDocument())[id] || null; }
  isCurrent(review) { return Boolean(review && review.expiresAt > this.now()); }
  async createReview(proposal) {
    return this.store.mutateDocument((document) => {
      if (document[proposal.id]) return document[proposal.id];
      const createdAt = this.now();
      document[proposal.id] = { ...proposal, status: "pending", createdAt, expiresAt: createdAt + 7 * 86400000 };
      return document[proposal.id];
    });
  }
  async decideReview(id, status, adminId) {
    if (!["approved", "rejected"].includes(status)) return null;
    return this.store.mutateDocument((document) => {
      const review = document[id];
      if (!this.isCurrent(review) || review.status !== "pending") return null;
      Object.assign(review, { status, decidedBy: String(adminId), decidedAt: this.now() });
      return review;
    });
  }
  async markCollected(match) {
    return this.store.mutateDocument((document) => {
      const reviews = Object.values(document).filter((review) => review.status === "approved" && !review.collectedAt
        && review.expected.id === match.id && review.expected.onlineGameId === String(match.onlineGameId));
      if (!reviews.length) return null;
      for (const review of reviews) review.collectedAt = this.now();
      return reviews.length;
    });
  }
}
