import { automobilistDefenders } from "./automobilistDefenders.js";
import { automobilistForwards } from "./automobilistForwards.js";
import { automobilistGoalkeepers } from "./automobilistGoalkeepers.js";

export const playerRecords = [
  ...automobilistGoalkeepers,
  ...automobilistDefenders,
  ...automobilistForwards,
];
