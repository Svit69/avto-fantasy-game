export class SeasonMonth {
  constructor({ title, points, status, isLocked = false }) {
    this.title = title;
    this.points = points;
    this.status = status;
    this.isLocked = isLocked;
  }

  getReadablePoints() {
    return this.isLocked ? null : this.points;
  }
}
