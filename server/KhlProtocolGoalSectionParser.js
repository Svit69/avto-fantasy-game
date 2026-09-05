export class KhlProtocolGoalSectionParser {
  parseScorerRows(content, teamName) {
    return this.#getGoalLines(content).flatMap((line) => this.#parseLine(line, teamName));
  }

  #getGoalLines(content) {
    const lines = content.text.split("\n");
    const start = lines.findIndex((line) => line.trim() === "ГОЛЫ");
    if (start < 0) return [];
    const end = lines.findIndex((line, index) => index > start && line.trim() === "УДАЛЕНИЯ");
    return lines.slice(start + 2, end > start ? end : undefined).filter((line) => /^\d+\s/.test(line));
  }

  #parseLine(line, teamName) {
    const escapedTeam = this.#escapeRegExp(teamName);
    const match = line.match(new RegExp(`\\s${escapedTeam}\\s+(\\d{1,3})\\s+(.+?)(?=\\s+\\d{1,3}\\s+[А-ЯЁ]|\\s+\\d+(?:,|$)|$)`));
    if (!match) return [];
    return [{ team: teamName, number: match[1], name: match[2].trim(), goals: 1 }];
  }

  #escapeRegExp(value) {
    return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
}
