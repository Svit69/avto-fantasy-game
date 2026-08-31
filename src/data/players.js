import { createAvtomobilistPlayers } from "./avtomobilistPlayers.js";
import { createGornyakPlayers } from "./gornyakPlayers.js";
import { createMhkAutoPlayers } from "./mhkAutoPlayers.js";
import { PlayerDataFactory } from "./playerDataFactory.js";

const playerDataFactory = new PlayerDataFactory();

export const INITIAL_PLAYERS = Object.freeze([
  ...createAvtomobilistPlayers(playerDataFactory),
  ...createGornyakPlayers(playerDataFactory),
  ...createMhkAutoPlayers(playerDataFactory),
]);
