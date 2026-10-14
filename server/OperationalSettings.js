export class OperationalSettings {
  static readNumber(name, fallback, minimum = 1, maximum = 1_000_000_000) {
    const value = Number(process.env[name] ?? fallback);
    return Number.isFinite(value) && value >= minimum && value <= maximum ? value : fallback;
  }
}
