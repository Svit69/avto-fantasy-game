import { KhlOnlineWorkerFactory } from "./KhlOnlineWorkerFactory.js";
import { MhlMirrorDataProvider } from "./MhlMirrorDataProvider.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";

export class MhlOnlineWorkerFactory extends KhlOnlineWorkerFactory {
  constructor(root, logger) { super(root, logger, OnlineHockeyLeagueConfiguration.mhl()); }
  createDataProvider(options) { return new MhlMirrorDataProvider(options); }
}
