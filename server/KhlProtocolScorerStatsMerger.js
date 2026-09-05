export class KhlProtocolScorerStatsMerger {
  mergeScorerGoals(rows, scorerRows) {
    return scorerRows.reduce((mergedRows, scorerRow) => {
      const index = mergedRows.findIndex((row) => this.#isSamePlayer(row, scorerRow));
      return index >= 0 ? this.#updateExistingRow(mergedRows, index, scorerRow) : [...mergedRows, scorerRow];
    }, rows);
  }

  #updateExistingRow(rows, index, scorerRow) {
    const row = rows[index];
    const goals = Math.max(row.goals || 0, scorerRow.goals || 0);
    const shotsOnGoal = Math.max((row.shotsOnGoal || 0) + (row.goals || 0) - goals, 0);
    return rows.map((item, itemIndex) => itemIndex === index ? { ...row, goals, shotsOnGoal } : item);
  }

  #isSamePlayer(row, scorerRow) {
    return row.number === scorerRow.number && this.#normalize(row.team) === this.#normalize(scorerRow.team)
      && this.#normalize(row.name) === this.#normalize(scorerRow.name);
  }

  #normalize(value) {
    return String(value || "").toLowerCase().replace(/ё/g, "е").replace(/\s+/g, " ").trim();
  }
}
