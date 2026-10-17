import { KhlMirrorDataProvider } from "./KhlMirrorDataProvider.js";
import { MhlMirrorDataSource } from "./MhlMirrorDataSource.js";
import { OnlineHockeyLeagueConfiguration } from "./OnlineHockeyLeagueConfiguration.js";

export class MhlMirrorDataProvider extends KhlMirrorDataProvider {
  constructor(options) {
    super({ ...options, dataSource: options.dataSource || new MhlMirrorDataSource(), configuration: OnlineHockeyLeagueConfiguration.mhl() });
  }
}
