import { PlayerVideoNoteSelector } from "./PlayerVideoNoteSelector.js";
export class PlayerVideoNotificationPlanner {
  constructor({ rosterRepository, playerCatalogRepository, selector = new PlayerVideoNoteSelector(), windowMs = 86400000 }) {
    Object.assign(this, { rosterRepository, playerCatalogRepository, selector, windowMs });
  }
  async createNotificationJobs(calendar, users, now = Date.now()) {
    const tours = (calendar.tours || []).filter((tour) => {
      const deadline = Date.parse(tour.deadlineAt);
      return deadline <= now && now - deadline <= this.windowMs;
    });
    if (!tours.length) return [];
    const players = await this.playerCatalogRepository.listPlayers();
    if (!players.some((player) => player.status !== "left_game" && player.videoNote?.fileId)) return [];
    const rosters = await this.rosterRepository.listRosters();
    const jobs = new Map();
    for (const tour of tours) for (const user of users.filter((item) => item.status === "active")) {
      const deadline = Date.parse(tour.deadlineAt);
      const roster = rosters.find((item) => String(item.userId) === String(user.id) && item.month === tour.month);
      if (!roster || (roster.status && roster.status !== "confirmed") || Date.parse(roster.updated_at) > deadline) continue;
      const player = this.selector.selectPlayer(roster, players, tour.id, user.id, deadline);
      if (!player) continue;
      const key = `player-video:${tour.id}`;
      jobs.set(`${user.id}:${key}`, { userId: user.id, key, videoNote: player.videoNote.fileId, playerId: player.id });
    }
    return [...jobs.values()];
  }
}
