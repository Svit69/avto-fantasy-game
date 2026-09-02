export class KhlHarPayloadExtractor {
  extractPayloads(har) {
    return (har.log?.entries || []).flatMap((entry) => this.#extractEntryPayload(entry)).filter(Boolean);
  }

  #extractEntryPayload(entry) {
    const text = entry.response?.content?.text;
    if (!text || !this.#looksLikeJson(entry)) return null;
    try { return JSON.parse(text); } catch { return null; }
  }

  #looksLikeJson(entry) {
    return String(entry.response?.content?.mimeType || "").includes("json") || String(entry.response?.content?.text || "").trim().startsWith("{");
  }
}
