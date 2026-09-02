export class KhlProtocolFantasyEventFactory {
  createRawEvents(rows, matcher) {
    return rows.flatMap((row) => {
      const player = matcher.findPlayer(row);
      return player ? this.#createPlayerEvents(player, row) : [];
    });
  }

  #createPlayerEvents(player, row) {
    return Object.entries(this.#createEventCounts(row)).flatMap(([eventType, count]) => {
      return Array.from({ length: count }, (_, index) => this.#createEvent(player, eventType, row, index));
    });
  }

  #createEventCounts(row) {
    return {
      goal: row.goals || 0,
      assist: row.assists || 0,
      penalty: row.penalties || 0,
      shotOnGoal: row.shotsOnGoal || 0,
      blockedShot: row.blockedShots || 0,
      hit: row.hits || 0,
      takeaway: row.takeaways || 0,
      interception: row.interceptions || 0,
      save: row.saves || 0,
      goalAgainst: row.goalsAgainst || 0,
    };
  }

  #createEvent(player, eventType, row, index) {
    return { id: `${row.team}:${row.number}:${eventType}:${index + 1}`, eventType, playerId: player.id, teamId: row.team, sourceVersion: "khl-protocol-pdf-v1" };
  }
}
