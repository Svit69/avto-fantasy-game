import { AVTOMOBILIST_NUMBERS } from "./avtomobilistNumbers.js";
import { GORNYAK_NUMBERS } from "./gornyakNumbers.js";
import { MHK_AUTO_NUMBERS } from "./mhkAutoNumbers.js";

export const PLAYER_NUMBERS = Object.freeze({
  ...AVTOMOBILIST_NUMBERS,
  ...GORNYAK_NUMBERS,
  ...MHK_AUTO_NUMBERS,
});
