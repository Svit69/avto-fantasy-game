export class VhlOnlineUrlResolver {
  resolveUrl(value) {
    const gameId = this.resolveGameId(value);
    if (!gameId) throw new Error("vhl_online_game_id_missing");
    return `https://online.vhlru.ru/online/${gameId}.html`;
  }

  resolveGameId(value) {
    return String(value || "").match(/(\d{5,})/)?.[1] || "";
  }
}
