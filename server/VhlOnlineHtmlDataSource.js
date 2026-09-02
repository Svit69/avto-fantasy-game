export class VhlOnlineHtmlDataSource {
  constructor(fetcher = fetch) { this.fetcher = fetcher; }

  async loadHtml(url) {
    const response = await this.fetcher(url, { headers: { "user-agent": "avto-fantasy-game/1.0" } });
    if (!response.ok) throw new Error(`vhl_online_http_${response.status}`);
    return response.text();
  }
}
