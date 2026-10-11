export class PlayerPriceReviewMath {
  static calculateMean(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
  static calculateMedian(values) {
    if (!values.length) return 0;
    const sorted = [...values].sort((first, second) => first - second);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  }
  static calculateVariability(values) {
    const mean = this.calculateMean(values);
    return Math.sqrt(this.calculateMean(values.map((value) => (value - mean) ** 2))) / Math.max(Math.abs(mean), 10);
  }
  static calculateWeightedMedian(entries) {
    const sorted = entries.filter((entry) => Number.isFinite(entry.value) && Number.isFinite(entry.weight) && entry.weight > 0).sort((first, second) => first.value - second.value);
    const halfWeight = sorted.reduce((sum, entry) => sum + entry.weight, 0) / 2;
    let cumulative = 0;
    for (let index = 0; index < sorted.length; index += 1) {
      cumulative += sorted[index].weight;
      if (Math.abs(cumulative - halfWeight) <= Number.EPSILON * Math.max(1, halfWeight) * sorted.length) return (sorted[index].value + (sorted[index + 1]?.value ?? sorted[index].value)) / 2;
      if (cumulative > halfWeight) return sorted[index].value;
    }
    return 0;
  }
}
