import { MhkAutoCalendarFactory } from "./MhkAutoCalendarFactory.js";
import { MHK_AUTO_CALENDAR_ROWS_FIRST_HALF } from "./mhkAutoCalendarRowsFirstHalf.js";
import { MHK_AUTO_CALENDAR_ROWS_SECOND_HALF } from "./mhkAutoCalendarRowsSecondHalf.js";
import { MHL_MATCH_PROTOCOL_IDS } from "./mhlMatchProtocolIds.js";

const calendarFactory = new MhkAutoCalendarFactory();

export const MHK_AUTO_MATCHES = calendarFactory.createMatches([...MHK_AUTO_CALENDAR_ROWS_FIRST_HALF, ...MHK_AUTO_CALENDAR_ROWS_SECOND_HALF]).map((match) => {
  const mhlGameId = MHL_MATCH_PROTOCOL_IDS[match.id];
  return mhlGameId ? { ...match, mhlGameId } : match;
});
