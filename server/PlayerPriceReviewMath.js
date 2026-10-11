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
}
