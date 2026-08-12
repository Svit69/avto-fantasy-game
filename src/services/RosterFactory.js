import { RosterSlot } from "../models/RosterSlot.js";
import { TeamRoster } from "../models/TeamRoster.js";
import { playerRecords } from "../data/players.js";
import { playerPositions } from "../data/positions.js";
import { createPlayersFromRecords } from "./PlayerFactory.js";

export function buildInitialRoster() {
  const players = createStarterPlayers();
  const slots = [
    new RosterSlot(playerPositions.goalkeeper, players[0]),
    new RosterSlot(playerPositions.defender, players[1]),
    new RosterSlot(playerPositions.defender),
    new RosterSlot(playerPositions.forward, players[2]),
    new RosterSlot(playerPositions.forward),
    new RosterSlot(playerPositions.forward),
  ];

  return new TeamRoster(slots, 100);
}

function createStarterPlayers() {
  const players = createPlayersFromRecords(playerRecords);

  return [
    findPlayerByLastName(players, "Аликин"),
    findPlayerByLastName(players, "Блэкер"),
    findPlayerByLastName(players, "Голышев"),
  ];
}

function findPlayerByLastName(players, lastName) {
  return players.find((player) => player.getLastName() === lastName);
}
