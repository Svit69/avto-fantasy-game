import { RussianCountFormatter } from "../src/formatters/RussianCountFormatter.js";
import { PlayerMatchStatRowFactory } from "../src/views/PlayerMatchStatRowFactory.js";
import { PlayerMatchCalendarView } from "../src/views/PlayerMatchCalendarView.js";

export class PlayerStatisticsPresentationSelfTest {
  run() {
    const formatter = new RussianCountFormatter();
    if (formatter.formatCount(2, ["передача", "передачи", "передач"]) !== "2 передачи") throw new Error("assists_declension_failed");
    if (formatter.formatCount(3, ["бросок", "броска", "бросков"]) !== "3 броска") throw new Error("shots_declension_failed");
    if (formatter.formatCount(11, ["отбор", "отбора", "отборов"]) !== "11 отборов") throw new Error("takeaways_declension_failed");
    const rows = new PlayerMatchStatRowFactory().createRows({ getPosition: () => "защитник" }, { takeaways: 2, interceptions: 3 });
    if (rows[0]?.label !== "2 отбора" || rows[0]?.points !== 20 || rows[1]?.label !== "3 перехвата") {
      throw new Error("player_match_defensive_stats_failed");
    }
    const calendarView = new PlayerMatchCalendarView(undefined, undefined, undefined, { selectPlayerMonthMatches: () => [] });
    if (!calendarView.render({}, {}, "Сентябрь").includes("data-open-scoring-guide")) throw new Error("player_scoring_guide_link_failed");
  }
}
