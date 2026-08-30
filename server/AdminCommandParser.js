export class AdminCommandParser {
  parseAdminCommand(text = "") {
    const [command, playerId, ...rest] = text.trim().split(/\s+/);
    if (command === "/set_price") return { type: "set_price", playerId, price: Number(rest[0]) };
    if (command === "/set_team") return { type: "set_team", playerId, team: rest.join(" ") };
    if (command === "/users") return { type: "users" };
    if (command === "/players") return { type: "players" };
    if (command === "/admin") return { type: "admin" };
    return null;
  }
}
