import crypto from "node:crypto";
export class AdminPlayerDirectory {
  positions = { all: "Все позиции", f: "нападающий", d: "защитник", g: "вратарь" };
  listTeams(players) {
    return [...new Set(players.map((player) => player.team).filter(Boolean))].sort((a, b) => a.localeCompare(b, "ru"))
      .map((name) => ({ name, code: crypto.createHash("sha256").update(name).digest("hex").slice(0, 8) }));
  }
  selectPlayers(players, code, position = "all") {
    const team = this.listTeams(players).find((item) => item.code === code)?.name;
    return players.filter((player) => player.team === team && (position === "all" || player.position === this.positions[position]))
      .sort((a, b) => a.lastName.localeCompare(b.lastName, "ru"));
  }
}
