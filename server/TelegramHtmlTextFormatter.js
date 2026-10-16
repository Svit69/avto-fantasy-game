export class TelegramHtmlTextFormatter {
  escapeText(value, limit = 256) {
    return String(value || "").slice(0, limit).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }
}
