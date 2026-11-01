import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { AtomicJsonDocumentStore } from "./AtomicJsonDocumentStore.js";
import { VhlMatchReviewRepository } from "./VhlMatchReviewRepository.js";
import { VhlMatchReviewPolicy } from "./VhlMatchReviewPolicy.js";

export async function createVhlReviewFixture() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "vhl-review-"));
  const filePath = path.join(directory, "reviews.json"); let now = Date.now();
  const repository = new VhlMatchReviewRepository(new AtomicJsonDocumentStore(filePath), () => now);
  const startsAt = new Date(now - 72 * 3600000).toISOString();
  const match = { id: "review-match", league: "ВХЛ", featuredTeam: "Горняк-УГМК", homeTeam: "Горняк-УГМК",
    awayTeam: "Торос", startsAt, onlineGameId: "904300", onlineProtocolId: "904300", tourId: "tour" };
  const source = { gameId: "904300", homeTeam: match.homeTeam, awayTeam: "Торос Нефтекамск", scheduledAt: `${startsAt.slice(0, 10)}T00:00:00+03:00` };
  const policy = new VhlMatchReviewPolicy(); const proposal = policy.createProposal(match, source);
  return { directory, filePath, repository, match, source, policy, proposal,
    getNow: () => now, advance: (duration) => { now += duration; },
    dispose: () => fs.rm(directory, { recursive: true, force: true }) };
}
