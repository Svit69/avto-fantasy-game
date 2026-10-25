import { RosterJsonStore } from "./RosterJsonStore.js";

export class RosterRepository {
  constructor(filePath) {
    this.filePath = filePath; this.store = new RosterJsonStore(filePath);
  }

  async saveRoster(userId, month, slots, deadlineTime = Infinity) {
    const nextRoster = { userId: String(userId), month, status: "confirmed", slots, updated_at: new Date().toISOString() };
    return this.store.mutateRosters((rosters) => {
      if (Date.now() >= deadlineTime) return null;
      const index = rosters.findIndex((roster) => this.#isSameRosterScope(roster, nextRoster));
      if (index < 0) rosters.push(nextRoster); else rosters[index] = nextRoster;
      return nextRoster;
    }, deadlineTime);
  }
  async saveRosterBeforeDeadline(userId, month, slots, deadlineTime) { return this.saveRoster(userId, month, slots, deadlineTime); }
  async findRosterByUserAndMonth(userId, month) {
    const rosters = await this.store.readRosters();
    return rosters.find((roster) => roster.userId === String(userId) && roster.month === month) || null;
  }

  async listRosters() { return this.store.readRosters(); }
  async listRostersByMonth(month) {
    return (await this.store.readRosters()).filter((roster) => roster.month === month);
  }

  #isSameRosterScope(roster, nextRoster) { return roster.userId === nextRoster.userId && roster.month === nextRoster.month; }
  async replaceRosterIfUnchanged(expected, next, deadlineTime) {
    return (await this.replaceRostersIfUnchanged([{ expected, next }], deadlineTime))[0] || null;
  }
  async replaceRostersIfUnchanged(changes, deadlineTime) {
    if (!changes.length) return [];
    return this.store.mutateRosters((rosters) => {
      if (Date.now() >= deadlineTime) return null;
      const indices = new Map(rosters.map((roster, index) => [JSON.stringify([roster.userId, roster.month]), index]));
      const saved = [];
      for (const { expected, next } of changes) {
        const index = indices.get(JSON.stringify([expected.userId, expected.month]));
        if (index === undefined || JSON.stringify(rosters[index]) !== JSON.stringify(expected)) continue;
        rosters[index] = next; saved.push(next);
      }
      return saved.length ? saved : null;
    }, deadlineTime).then((saved) => saved || []);
  }
}
