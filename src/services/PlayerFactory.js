import { Player } from "../models/Player.js";
import { clubs } from "../data/clubs.js";
import { normalizePlayerPosition } from "../data/positions.js";

export function createPlayersFromRecords(records) {
  return records.map(createPlayerFromRecord);
}

function createPlayerFromRecord(record) {
  return new Player({
    id: buildPlayerId(record),
    firstName: record.firstName,
    lastName: record.lastName,
    birthDate: record.birthDate,
    position: normalizePlayerPosition(record.position),
    price: record.price,
    photoFileName: record.photo,
    club: clubs[record.clubId],
  });
}

function buildPlayerId(record) {
  return `${record.clubId}-${record.photo.replace(".png", "")}`;
}
