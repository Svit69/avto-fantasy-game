import { parse } from "acorn";

export class MhlOnlineRosterParser {
  parseRoster(document) {
    const scripts = document("script:not([src])").toArray().map((element) => document(element).text());
    for (const source of scripts.filter((text) => /\bgamePlayers\s*=/.test(text))) {
      const tree = parse(source, { ecmaVersion: "latest" });
      for (const statement of tree.body) for (const declaration of statement.declarations || []) {
        if (declaration.id?.name !== "gamePlayers") continue;
        const call = declaration.init;
        if (call?.type !== "CallExpression" || call.callee?.object?.name !== "JSON" || call.callee?.property?.name !== "parse"
          || call.arguments.length !== 1 || call.arguments[0].type !== "Literal" || typeof call.arguments[0].value !== "string") {
          throw new Error("mhl_roster_format_invalid");
        }
        const roster = JSON.parse(call.arguments[0].value);
        if (!roster.A || !roster.B) throw new Error("mhl_roster_teams_missing");
        for (const side of ["A", "B"]) for (const [number, player] of Object.entries(roster[side])) {
          if (!/^\d+$/.test(number) || !/^\d+$/.test(String(player.id)) || !player.name
            || !["н", "з", "в"].includes(player.pos) || ![0, 1].includes(Number(player.ig))) throw new Error("mhl_roster_player_invalid");
          player.jn = Number(number);
        }
        return roster;
      }
    }
    throw new Error("mhl_roster_missing");
  }
}
