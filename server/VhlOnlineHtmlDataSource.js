export class VhlOnlineHtmlDataSource {
  constructor(fetcher = fetch) { this.fetcher = fetcher; }

  async loadHtml(url) {
    const response = await this.fetcher(url, { headers: { "user-agent": "avto-fantasy-game/1.0" } });
    if (!response.ok) throw new Error(`vhl_online_http_${response.status}`);
    if (response.url && /\/online\/\d+\.html$/.test(new URL(url).pathname)
      && new URL(response.url).pathname !== new URL(url).pathname) throw new Error("vhl_online_game_not_found");
    return response.text();
  }
}
