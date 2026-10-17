import { MhlOnlineEventIdentityReader } from "./MhlOnlineEventIdentityReader.js";
import { MhlOnlinePenaltyMinutesParser } from "./MhlOnlinePenaltyMinutesParser.js";

export class MhlOnlinePlayByPlayParser {
  constructor(reader = new MhlOnlineEventIdentityReader()) { this.reader = reader; }
  parseEvents(document, game) {
    const gameLegend = {}; const penalties = [];
    for (const node of document('#tab-game-playbyplay [data-type="shot"], #tab-game-playbyplay [data-type="goal"], #tab-game-playbyplay [data-type="penalty"]').toArray()) {
      const element = document(node); const type = element.attr("data-type");
      if (type === "shot" && element.attr("data-result") !== "saved") continue;
      const period = Number(element.attr("data-period"));
      if (!Number.isSafeInteger(period) || period < 1) throw new Error("mhl_event_period_invalid");
      const side = this.reader.readSide(element, game);
      const link = element.find('.game-legend-item-text-block a[href*="/players/"]').first();
      if (type === "penalty" && !link.length && /командный штраф/iu.test(element.text())) continue;
      const jn = this.reader.readPlayerNumber(link, game, side); const time = this.reader.readTime(element);
      if (type === "penalty") {
        const minutes = new MhlOnlinePenaltyMinutesParser().parseMinutes(element.find(".game-legend-item-info-type").text());
        penalties.push({ type: "pn", team: side, jn, pim: minutes });
      } else (gameLegend[period] ||= []).push({ type, teamAB: side, jn, time, result: type === "shot" ? "saved" : "" });
    }
    return { gameLegend, penalties };
  }
}
