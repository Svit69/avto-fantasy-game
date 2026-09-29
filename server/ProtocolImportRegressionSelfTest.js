import { KhlFantasyEventMapper } from "./KhlFantasyEventMapper.js";
import { KhlProtocolFantasyEventFactory } from "./KhlProtocolFantasyEventFactory.js";
import { KhlProtocolSkaterTableParser } from "./KhlProtocolSkaterTableParser.js";
import { VhlOnlineFantasyEventFactory } from "./VhlOnlineFantasyEventFactory.js";
import { SkaterFantasyPointsCalculator } from "../src/scoring/SkaterFantasyPointsCalculator.js";

export class ProtocolImportRegressionSelfTest {
  run() {
    const rows = new KhlProtocolSkaterTableParser().parseSkaterRows(this.#createProtocolContent(), "МХК Авто");
    const row = rows.find((item) => item.number === "23");
    this.#assert(row?.appearances === 1 && row.penalties === 0 && row.assists === 1 && row.shotsOnGoal === 3 && row.hits === 2 && row.takeaways === 2, "pdf_columns");
    this.#assert(rows.find((item) => item.number === "51")?.penalties === 1, "penalty_minutes");
    this.#assert(rows.find((item) => item.number === "15")?.shotsOnGoal === 1, "goal_shot_deduplication");
    const points = new SkaterFantasyPointsCalculator().calculateMatchFantasyPoints({
      position: "защитник", league: "МХЛ", team: "МХК Авто", events: row,
    });
    this.#assert(points === 43, "gamzakov_points");
    const player = { id: "gamzakov", team: "Горняк-УГМК", position: "защитник" };
    const matcher = { findPlayer: () => player };
    const emptyRow = { ...row, goals: 0, assists: 0, shotsOnGoal: 0, hits: 0, takeaways: 0 };
    const pdfEvents = new KhlProtocolFantasyEventFactory().createRawEvents([emptyRow], matcher);
    const vhlEvents = new VhlOnlineFantasyEventFactory([player]).createRawEvents([emptyRow], matcher);
    this.#assert([...pdfEvents, ...vhlEvents].filter((event) => event.eventType === "appearance").length === 2, "appearance");
    this.#assert(pdfEvents.every((event) => event.sourceVersion === "khl-protocol-pdf-v2"), "pdf_version");
    this.#assert(new VhlOnlineFantasyEventFactory([player]).createRawEvents([{ ...emptyRow, appearances: 0 }], matcher).length === 0, "unused_substitute");
    const mapped = new KhlFantasyEventMapper().createFantasyEvents({ eventType: "appearance", eventKey: "test", playerId: player.id });
    this.#assert(mapped[0]?.eventType === "appearances", "appearance_mapping");
  }

  #createProtocolContent() {
    const header = [["МХК Авто", 50], ["Ш", 160], ["А", 170], ["Штр", 210], ["Б", 398], ["Бс", 410],
      ["Бм", 425], ["БлБ", 450], ["СПр", 465], ["ОТБ", 480], ["ПХТ", 500]].map(([text, x]) => ({ text, x, y: 500 }));
    const player = [["23", 20], ["з", 35], ["Гамзаков Михаил", 60], ["1", 170], ["3", 410], ["1", 425],
      ["2", 465], ["2", 480], ["12:00", 240]].map(([text, x]) => ({ text, x, y: 490 }));
    const penalizedPlayer = [["51", 20], ["н", 35], ["Пимин Александр", 60], ["2", 214], ["18:31", 240]]
      .map(([text, x]) => ({ text, x, y: 480 }));
    const scorer = [["15", 20], ["н", 35], ["Голышев Анатолий", 60], ["2", 160], ["3", 410], ["15:11", 240]]
      .map(([text, x]) => ({ text, x, y: 470 }));
    return { pages: [[...header, ...player, ...penalizedPlayer, ...scorer]] };
  }

  #assert(condition, name) { if (!condition) throw new Error(`protocol_import_self_test_failed:${name}`); }
}
