import pdf from "pdf-parse/lib/pdf-parse.js";

export class KhlProtocolPdfTextExtractor {
  async extractPdfContent(pdfBuffer) {
    const pageRenderer = (pageData) => pageData.getTextContent({
      normalizeWhitespace: false,
      disableCombineTextItems: false,
    }).then((content) => JSON.stringify(content.items.map((item) => ({
      text: item.str,
      x: Math.round(item.transform[4]),
      y: Math.round(item.transform[5]),
    }))));
    const parsedPdf = await pdf(pdfBuffer, { pagerender: pageRenderer });
    const pages = parsedPdf.text.trim().split("\n\n").filter((page) => page.startsWith("[")).map(JSON.parse);
    return { pages, text: this.#createReadableText(pages), pageCount: pages.length };
  }

  #createReadableText(pages) {
    return pages.map((items) => {
      const grouped = this.#groupItemsByY(items);
      return [...grouped.entries()].sort((a, b) => b[0] - a[0]).map(([, row]) => {
        return row.sort((a, b) => a.x - b.x).map((item) => item.text).join(" ");
      }).join("\n");
    }).join("\n");
  }

  #groupItemsByY(items) {
    return items.reduce((grouped, item) => {
      grouped.set(item.y, [...(grouped.get(item.y) || []), item]);
      return grouped;
    }, new Map());
  }
}
