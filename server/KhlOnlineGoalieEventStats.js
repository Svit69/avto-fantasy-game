export class KhlOnlineGoalieEventStats {
  enrichRows(game, side, rows) {
    const events = (game.tab_events || []).flatMap((period) => period.events || []);
    return rows.map((row) => {
      const number = String(row.number);
      const ownGoals = events.filter((event) => event.type === "go" && event.team === side && String(event.rbm) !== "3");
      const penalties = events.filter((event) => event.type === "pn" && event.team === side && String(event.jn) === number);
      return { ...row, goals: ownGoals.filter((event) => String(event.scorer) === number).length,
        assists: ownGoals.filter((event) => [event.assist1, event.assist2].map(String).includes(number)).length,
        penalties: Math.ceil(penalties.reduce((sum, event) => sum + this.#readPenaltyMinutes(event.pim), 0) / 2) };
    });
  }
  #readPenaltyMinutes(value) {
    const minutes = Number(value);
    if (!Number.isSafeInteger(minutes) || minutes < 0 || minutes > 100) throw new Error("khl_online_goalie_penalty_invalid");
    return minutes;
  }
}
