import { MhlTeamNameNormalizer } from "./MhlTeamNameNormalizer.js";
import { MhlOnlineEventIdentityReader } from "./MhlOnlineEventIdentityReader.js";

export class MhlOnlineGoalEventParser {
  parseGoals(document, game) {
    return document("#tab-game-events p").toArray().filter((node) => /^Изменение счета:/u.test(document(node).text().trim())).map((node) => {
      const element = document(node);
      const name = new MhlTeamNameNormalizer().normalizeTeamName(element.text().match(/^\s*Изменение счета:\s*(.+?)\./u)?.[1]);
      const side = name === game.teams.home.name ? "A" : name === game.teams.visitor.name ? "B" : null;
      if (!side) throw new Error("mhl_goal_team_unknown");
      const numbers = element.find('a[href*="/players/"]').toArray().map((link) => new MhlOnlineEventIdentityReader().readPlayerNumber(document(link), game, side));
      if (!numbers.length || numbers.length > 3) throw new Error("mhl_goal_players_invalid");
      return { type: "go", team: side, scorer: numbers[0], assist1: numbers[1], assist2: numbers[2],
        rbm: /буллит|серия бросков/iu.test(element.parent().text()) ? "3" : "0" };
    });
  }
}
