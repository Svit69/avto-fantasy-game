import { Player } from "../models/Player.js";
import { RosterSlot } from "../models/RosterSlot.js";
import { TeamRoster } from "../models/TeamRoster.js";
import { clubs } from "../data/clubs.js";

const positions = {
  goalkeeper: "ВРАТАРЬ",
  defender: "ЗАЩИТНИКИ",
  forward: "НАПАДАЮЩИЕ",
};

export function buildInitialRoster() {
  const players = createStarterPlayers();
  const slots = [
    new RosterSlot(positions.goalkeeper, players[0]),
    new RosterSlot(positions.defender, players[1]),
    new RosterSlot(positions.defender),
    new RosterSlot(positions.forward, players[2]),
    new RosterSlot(positions.forward),
    new RosterSlot(positions.forward),
  ];

  return new TeamRoster(slots, 100);
}

function createStarterPlayers() {
  return [
    createPlayer("gk-1", "Основной вратарь", positions.goalkeeper, 1.8, clubs.automobilist),
    createPlayer("df-1", "Левый защитник", positions.defender, 1.9, clubs.automobilist),
    createPlayer("fw-1", "Центр нападения", positions.forward, 1.8, clubs.gornyak),
  ];
}

function createPlayer(id, name, position, price, club) {
  return new Player({ id, name, position, price, club });
}
