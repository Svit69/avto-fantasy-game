import { load } from "cheerio";
import { MhlOnlineMatchInfoParser } from "./MhlOnlineMatchInfoParser.js";
import { KhlOnlineMatchParser } from "./KhlOnlineMatchParser.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";
import { LimitedResponseBodyReader } from "./LimitedResponseBodyReader.js";

export class MhlOnlineScheduleProbe {
  constructor(observer, fetcher = fetch) { Object.assign(this, { observer, fetcher }); }
  async inspectMatch(expected, state) {
    const id = expected.mhlGameId;
    if (!/^[1-9]\d{0,9}$/.test(String(id))) throw Error("mhl_invalid_game_id");
    const response = await this.fetcher(`https://text.mhl.khl.ru/${id}.html`, { signal: AbortSignal.timeout(15000), redirect: "error", cache: "no-store" });
    if (!response.ok) throw Error(`mhl_schedule_http_${response.status}`);
    const html = (await new LimitedResponseBodyReader().readBuffer(response, 4194304)).toString("utf8");
    const game = new MhlOnlineMatchInfoParser().parseMatchInfo(load(html), String(id));
    const match = new KhlOnlineMatchParser(OnlineHockeyLeagueConfiguration.mhl()).parseMatch(game, expected);
    await this.observer.observeMatch(expected, match);
    return { ok: true, reason: "schedule_checked", state: { ...state, failures: 0, sourceStatus: match.status } };
  }
}
