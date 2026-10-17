export class MhlOnlinePenaltyMinutesParser {
  parseMinutes(text) {
    if (/\(буллит\)/iu.test(text)) return 0;
    const match = String(text).match(/\((\d+(?:\s*\+\s*\d+)*)\s*мин\)/iu);
    if (!match) throw new Error("mhl_penalty_minutes_missing");
    const minutes = match[1].split("+").reduce((sum, part) => sum + Number(part.trim()), 0);
    if (minutes > 100) throw new Error("mhl_penalty_minutes_invalid");
    return minutes;
  }
}
