export class StandingsPageFactory {
  createResponse(report, profileId, params) {
    const currentUser = report.entries.find((entry) => entry.userId === String(profileId)) || null;
    if (params.get("summary") === "1") return { month: report.month, currentUser };
    if (!params.has("limit")) return { ...report, currentUser };
    const readInteger = (value, maximum) => {
      if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value)) || Number(value) > maximum) throw Object.assign(new Error("invalid_standings_page"), { statusCode: 400 });
      return Number(value);
    };
    const limit = readInteger(params.get("limit"), 100);
    if (!limit) throw Object.assign(new Error("invalid_standings_page"), { statusCode: 400 });
    let offset = readInteger(params.get("offset") || "0", 1000000);
    if (offset && params.get("version") !== report.version) offset = 0;
    const entries = report.entries.slice(offset, offset + limit);
    return { ...report, currentUser, entries, offset, totalEntries: report.entries.length,
      nextOffset: offset + entries.length < report.entries.length ? offset + entries.length : null };
  }
}
