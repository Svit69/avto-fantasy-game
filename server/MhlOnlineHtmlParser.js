import { load } from "cheerio";
import { MhlOnlineMatchInfoParser } from "./MhlOnlineMatchInfoParser.js";
import { MhlOnlineRosterParser } from "./MhlOnlineRosterParser.js";
import { MhlOnlineStatsParser } from "./MhlOnlineStatsParser.js";
import { MhlOnlinePlayByPlayParser } from "./MhlOnlinePlayByPlayParser.js";
import { MhlOnlineGoalieChangeParser } from "./MhlOnlineGoalieChangeParser.js";
import { MhlOnlineGoalEventParser } from "./MhlOnlineGoalEventParser.js";
import { MhlOnlineStatisticsValidator } from "./MhlOnlineStatisticsValidator.js";

export class MhlOnlineHtmlParser {
  parseGame(html, gameId) {
    const document = load(html);
    const game = new MhlOnlineMatchInfoParser().parseMatchInfo(document, gameId);
    if (game.gameItem.status === 0) return game;
    try {
      game.players = new MhlOnlineRosterParser().parseRoster(document);
      game.tab_stats = new MhlOnlineStatsParser().parseStats(document, game);
      new MhlOnlineStatisticsValidator().validateScore(game);
      const events = new MhlOnlinePlayByPlayParser().parseEvents(document, game);
      game.tab_playbyplay = { gameLegend: events.gameLegend };
      game.tab_events = [{ events: [...events.penalties, ...new MhlOnlineGoalEventParser().parseGoals(document, game)] }];
      game.tab_events[0].events.push(...new MhlOnlineGoalieChangeParser().parseChanges(document, game));
      return game;
    } catch (error) { error.matchIdentity = game; throw error; }
  }
}
