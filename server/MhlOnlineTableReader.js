import { MhlOnlineColumnMap } from "./MhlOnlineColumnMap.js";
export class MhlOnlineTableReader {
  readRows(document, selector, requiredColumns) {
    const table = document(selector);
    if (table.length !== 1) throw new Error("mhl_stats_table_missing");
    const columns = table.find("thead tr").first().children("th").map((index, element) => new MhlOnlineColumnMap().normalizeColumn(document(element).text())).get();
    if (requiredColumns.some((name) => columns.filter((column) => column === name).length !== 1)) throw new Error("mhl_stats_columns_missing");
    return table.find("tbody tr").map((index, element) => {
      const cells = document(element).children("td").map((cellIndex, cell) => document(cell).text().trim()).get();
      if (cells.length !== columns.length) throw new Error("mhl_stats_row_incomplete");
      return Object.fromEntries(columns.map((column, cellIndex) => [column, cells[cellIndex]]));
    }).get();
  }
  readCount(value) {
    if (value === "") return 0;
    if (!/^\d+$/.test(String(value)) || Number(value) > 500) throw new Error("mhl_stats_count_invalid");
    return Number(value);
  }
}
