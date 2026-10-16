export class ImportedMatchPriorityPolicy {
  compare(candidate, current) {
    if (!current) return 1;
    const priority = this.#priority(candidate) - this.#priority(current);
    return priority || this.#time(candidate) - this.#time(current);
  }
  #priority(match) { return match?.sourceType === "khl-online" ? 0 : 1; }
  #time(match) { return Date.parse(match?.updatedAt || match?.lastEventAt || match?.createdAt || "") || 0; }
}
