export class AssetWebpReport {
  render(results) {
    const totals = this.#calculateTotals(results);
    return JSON.stringify(totals, null, 2);
  }

  #calculateTotals(results) {
    return results.reduce((totals, result) => ({
      ...totals,
      [result.status]: Number(totals[result.status] || 0) + 1,
      savedBytes: totals.savedBytes + this.#calculateSavedBytes(result),
    }), { converted: 0, skipped: 0, larger_removed: 0, savedBytes: 0 });
  }

  #calculateSavedBytes(result) {
    return result.status === "converted" ? result.sourceSize - result.targetSize : 0;
  }
}
