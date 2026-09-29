export class RussianCountFormatter {
  formatCount(count, [one, few, many]) {
    return `${count} ${this.selectWordForm(count, [one, few, many])}`;
  }

  selectWordForm(count, [one, few, many]) {
    const value = Math.abs(Number(count)) % 100;
    const lastDigit = value % 10;
    if (value > 10 && value < 20) return many;
    if (lastDigit === 1) return one;
    return lastDigit >= 2 && lastDigit <= 4 ? few : many;
  }
}
