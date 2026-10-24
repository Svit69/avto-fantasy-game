import path from "node:path";
import { createOperationsTestWorkspace } from "./operations-test-workspace.js";
import { RosterRepository } from "./RosterRepository.js";

export async function createRosterPriceFixture() {
  const workspace = await createOperationsTestWorkspace(); const previous = process.env.RUNTIME_STATE_DIRECTORY;
  process.env.RUNTIME_STATE_DIRECTORY = path.join(workspace.directory, "runtime");
  const now = Date.now();
  const tours = ["past", "current", "next", "closed"].map((month, index) => ({ id: month, title: month, month,
    deadlineAt: new Date(now + (index - 1.5) * 86400000).toISOString() }));
  const players = Array.from({ length: 6 }, (_, index) => ({ id: `p${index}`, firstName: "Test", lastName: String(index), price: index ? 15 : 20 }));
  const slots = players.map((player, slotIndex) => ({ playerId: player.id, slotIndex, position: slotIndex < 3 ? "нападающий" : slotIndex < 5 ? "защитник" : "вратарь", lockedPrice: 15 }));
  const rosterRepository = new RosterRepository(path.join(workspace.directory, "storage/rosters.json"));
  return { ...workspace, now, calendar: { tours, matches: [] }, players, slots, rosterRepository,
    playerCatalogRepository: { async listPlayers() { return players; } },
    close: async () => { if (previous === undefined) delete process.env.RUNTIME_STATE_DIRECTORY; else process.env.RUNTIME_STATE_DIRECTORY = previous; await workspace.close(); } };
}
