import { playerPositions } from "./positions.js";

export const playerFilters = [
  { label: "Все", value: "all" },
  { label: "Вратари", value: playerPositions.goalkeeper },
  { label: "Защитники", value: playerPositions.defender },
  { label: "Нападающие", value: playerPositions.forward },
];
