import { Player } from "../models/Player.js";
import { RosterSlot } from "../models/RosterSlot.js";
import { TeamRoster } from "../models/TeamRoster.js";

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
    new Player({ id: "gk-1", name: "Основной вратарь", position: positions.goalkeeper, price: 1.8 }),
    new Player({ id: "df-1", name: "Левый защитник", position: positions.defender, price: 1.9 }),
    new Player({ id: "fw-1", name: "Центр нападения", position: positions.forward, price: 1.8 }),
  ];
}
