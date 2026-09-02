export class HtmlTextCleaner {
  stripTags(html) {
    return this.decodeEntities(String(html || "").replace(/<[^>]*>/g, " "));
  }

  decodeEntities(text) {
    return String(text || "")
      .replace(/&nbsp;/g, " ")
      .replace(/&quot;/g, "\"")
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
      .replace(/\s+/g, " ")
      .trim();
  }
}
