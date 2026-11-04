import { KhlMirrorDataSource } from "./KhlMirrorDataSource.js";
import { MhlMirrorCaptureDecoder } from "./MhlMirrorCaptureDecoder.js";
import { MhlOfficialGoalieDataSource } from "./MhlOfficialGoalieDataSource.js";

export class MhlMirrorDataSource extends KhlMirrorDataSource {
  constructor(fetcher = (...args) => fetch(...args), timeoutMs = 300000, goalieSource = new MhlOfficialGoalieDataSource()) {
    super(fetcher, timeoutMs, { endpoint: "mhl", createDecoder: () => new MhlMirrorCaptureDecoder() });
    this.goalieSource = goalieSource;
  }
  async loadGame(gameId) {
    try { return await super.loadGame(gameId); }
    catch (error) {
      if (error.message !== "mhl_goalie_change_ambiguous" || !error.matchIdentity) throw error;
      try { return await this.goalieSource.resolveGoalies(error.matchIdentity, gameId); }
      catch (fallbackError) {
        if (!/^mhl_(?:goalie_protocol|protocol_goalie)/.test(fallbackError.message)) fallbackError.message = `mhl_goalie_protocol_unavailable:${fallbackError.message}`;
        fallbackError.matchIdentity = error.matchIdentity; throw fallbackError;
      }
    }
  }
}
