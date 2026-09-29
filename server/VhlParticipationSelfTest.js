import { VhlOnlineStatsRowParser } from "./VhlOnlineStatsRowParser.js";
import { VhlReportStatsParser } from "./VhlReportStatsParser.js";

export class VhlParticipationSelfTest {
  run() {
    const onlineRows = new VhlOnlineStatsRowParser().parseRows(this.#createOnlineTable(), "Горняк-УГМК");
    if (onlineRows[0]?.appearances !== 1 || onlineRows[1]?.appearances !== 0) {
      throw new Error("vhl_online_participation_self_test_failed");
    }
    const reportRows = new VhlReportStatsParser().parseRows(this.#createReport(), "Горняк-УГМК");
    if (reportRows[0]?.appearances !== 0) throw new Error("vhl_report_participation_self_test_failed");
  }

  #createOnlineTable() {
    return `<tbody>${this.#createRow(["23", "Гамзаков Михаил(з)", "", "", "", "", "", "", "", "", "", "", "5:32(8)"])}
      ${this.#createRow(["35", "Тулинов Никита(вр)", "", "", "", "", "", "", "", "", "", "", ""])}</tbody>`;
  }

  #createReport() {
    const row = this.#createRow(["35", "Тулинов Никита", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0"]);
    return `<h4 class="table-wrap__team-name">Горняк-УГМК</h4><h5>Вратари</h5><tbody>${row}</tbody>`;
  }

  #createRow(cells) { return `<tr>${cells.map((cell) => `<td>${cell}</td>`).join("")}</tr>`; }
}
