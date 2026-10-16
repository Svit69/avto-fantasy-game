import crypto from "node:crypto";
export class PlayerVideoNoteSelector {
  selectPlayer(roster, players, tourId, userId, cutoff = Infinity) {
    const ids = (roster?.slots || []).map((slot) => slot.playerId).filter(Boolean);
    if (ids.length !== 6 || new Set(ids).size !== 6) return null;
    const candidates = players.filter((player) => ids.includes(player.id) && player.status !== "left_game" && player.videoNote?.fileId
      && Date.parse(player.videoNote.uploadedAt) <= cutoff).sort((a, b) => a.id.localeCompare(b.id));
    if (!candidates.length) return null;
    const index = crypto.createHash("sha256").update(`${tourId}:${userId}`).digest().readUInt32BE(0) % candidates.length;
    return candidates[index];
  }
}
