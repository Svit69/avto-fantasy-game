import fs from "node:fs/promises";
import path from "node:path";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { CALENDAR_MATCHES, CALENDAR_TOURS } from "../src/data/calendarSeed.js";

export class SyntheticLoadFixture {
  createData(userCount) {
    const tour = CALENDAR_TOURS.find((item) => item.id === "2026-10-test-2"); const month = tour.month;
    const scheduled = CALENDAR_MATCHES.filter((match) => match.tourId === tour.id);
    const matches = scheduled.map((match) => ({ ...match, scheduledAt: match.startsAt, status: "finished",
      gameId: match.khlGameId || match.mhlGameId || match.onlineProtocolId || match.id, sourceType: "protocol" }));
    const playerStats = matches.flatMap((match, index) => INITIAL_PLAYERS.filter((player) => player.team === match.featuredTeam)
      .map((player, offset) => ({ matchId: match.id, playerId: player.id, fantasyPoints: (index * 7 + offset * 3) % 120, appearances: 1 })));
    const users = Array.from({ length: userCount }, (_, index) => ({ id: String(index + 1), name: `Manager ${index + 1}`, status: "active" }));
    const rosters = users.map((user, index) => ({ userId: user.id, month, status: "confirmed",
      slots: Array.from({ length: 6 }, (_, slot) => ({ id: `slot-${slot}`, playerId: INITIAL_PLAYERS[(index + slot) % INITIAL_PLAYERS.length].id, price: 10 })) }));
    return { users, rosters, players: INITIAL_PLAYERS, calendar: { tours: CALENDAR_TOURS, matches: CALENDAR_MATCHES },
      database: { matches, playerStats, events: [], pointEntries: [], runs: [], snapshots: [] }, month };
  }
  async writeFixture(directory, data) {
    const storage = path.join(directory, "storage"); await fs.mkdir(storage, { recursive: true });
    for (const [name, value] of Object.entries({ "users.json": { users: data.users }, "rosters.json": { rosters: data.rosters },
      "players.json": { players: data.players }, "calendar.json": data.calendar, "khl-match-data.json": data.database })) {
      await fs.writeFile(path.join(storage, name), JSON.stringify(value), "utf8");
    }
  }
}
