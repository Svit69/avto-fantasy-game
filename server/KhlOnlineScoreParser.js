export class KhlOnlineScoreParser {
  parseScore(info, status) {
    const parts = String(info.score || "").match(/^(\d+)\s*:\s*(\d+)$/);
    const decision = String(info.ots || "").trim().toUpperCase();
    const decisions = { "ОТ": "overtime", OT: "overtime", "Б": "shootout", "ПБ": "shootout", SO: "shootout" };
    if (decision && !decisions[decision]) throw new Error("khl_online_unknown_decision");
    if (!parts) {
      if (status === "finished") throw new Error("khl_online_final_score_missing");
      return null;
    }
    const score = { homeGoals: Number(parts[1]), awayGoals: Number(parts[2]), decidedBy: decisions[decision] || null };
    if (status === "finished" && score.decidedBy === "shootout" && score.homeGoals === score.awayGoals) {
      if (!["A", "B"].includes(info.winner)) throw new Error("khl_online_shootout_winner_missing");
      score[info.winner === "A" ? "homeGoals" : "awayGoals"] += 1;
    }
    if (status === "finished" && (score.homeGoals === score.awayGoals
      || score.decidedBy && Math.abs(score.homeGoals - score.awayGoals) !== 1)) throw new Error("khl_online_final_score_invalid");
    return score;
  }
}
