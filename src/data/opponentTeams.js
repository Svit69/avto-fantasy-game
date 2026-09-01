import { KHL_OPPONENT_TEAMS } from "./khlOpponentTeams.js";
import { MHL_OPPONENT_TEAMS } from "./mhlOpponentTeams.js";
import { VHL_OPPONENT_TEAMS } from "./vhlOpponentTeams.js";

export const OPPONENT_TEAMS = [...KHL_OPPONENT_TEAMS, ...VHL_OPPONENT_TEAMS, ...MHL_OPPONENT_TEAMS];
