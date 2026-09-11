export class KhlProtocolSkaterColumnMap {
  constructor() {
    this.columns = Object.freeze({
      goals: [156, 167],
      assists: [168, 175],
      penalties: [206, 216],
      shotsOnGoal: [421, 432],
      blockedShots: [445, 456],
      hits: [456, 469],
      takeaways: [476, 487],
      interceptions: [493, 505],
    });
  }

  getRange(columnName) {
    return this.columns[columnName] || [0, 0];
  }
}
