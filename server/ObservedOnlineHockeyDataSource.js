import { KhlOnlineMatchParser } from "./KhlOnlineMatchParser.js";

export class ObservedOnlineHockeyDataSource {
  constructor(source, expected, configuration, observer) { Object.assign(this, { source, expected, configuration, observer }); }
  async loadGame(gameId) {
    let game;
    try { game = await this.source.loadGame(gameId); }
    catch (error) {
      if (error.matchIdentity) {
        const match = await this.#observeGame(error.matchIdentity);
        error.observedMatch = match;
      }
      throw error;
    }
    await this.#observeGame(game);
    return game;
  }
  async #observeGame(game) {
    const match = new KhlOnlineMatchParser(this.configuration).parseMatch(game, this.expected);
    await this.observer.observeMatch(this.expected, match);
    return match;
  }
}
