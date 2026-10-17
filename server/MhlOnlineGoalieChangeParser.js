import { MhlOnlineEventIdentityReader } from "./MhlOnlineEventIdentityReader.js";

export class MhlOnlineGoalieChangeParser {
  constructor(reader = new MhlOnlineEventIdentityReader()) { this.reader = reader; }
  parseChanges(document, game) {
    const changes = document('#tab-game-playbyplay [data-type="goalkeeper"]').toArray().map((node, index) => {
      const element = document(node); const side = this.reader.readSide(element, game);
      const numbers = element.find('a[href*="/players/"]').toArray().map((link) => this.reader.readPlayerNumber(document(link), game, side));
      return { side, numbers, text: element.text(), time: this.reader.readTime(element), index };
    }).sort((first, second) => first.time - second.time || second.index - first.index);
    return ["A", "B"].flatMap((side) => {
      const keepers = Object.values(game.players[side]).filter((player) => player.pos === "в" && Number(player.ig) === 1);
      const relevant = changes.filter((change) => change.side === side);
      const replacement = relevant.find((change) => /вместо/iu.test(change.text) && change.numbers.length === 2);
      let current = keepers.length === 1 ? keepers[0].jn : replacement?.numbers[1];
      let previous = current;
      return relevant.map((change, index) => {
        let next;
        if (/на экстра[ -]полевого/iu.test(change.text)) next = 0;
        else if (/вратарь в воротах/iu.test(change.text)) next = change.numbers[0] ?? previous;
        else if (/вместо/iu.test(change.text) && change.numbers.length === 2 && change.numbers[1] === current) next = change.numbers[0];
        if (!Number.isFinite(current) || !Number.isFinite(next)
          || next && !keepers.some((keeper) => keeper.jn === next)) throw new Error("mhl_goalie_change_ambiguous");
        const event = { id: index + 1, type: "gc", teamAB: side, time_sec: change.time, prevGk: current, gkJn: next };
        if (next) previous = next;
        current = next;
        return event;
      });
    });
  }
}
