import { ROSTER_POSITIONS } from "./positions.js";

export const INITIAL_PLAYERS = Object.freeze([
  {
    firstName: "Анатолий",
    lastName: "Голышев",
    position: ROSTER_POSITIONS.forward,
    price: 6,
  },
  {
    firstName: "Даниэль",
    lastName: "Спронг",
    position: ROSTER_POSITIONS.forward,
    price: 11,
  },
  {
    firstName: "Никита",
    lastName: "Трямкин",
    position: ROSTER_POSITIONS.defender,
    price: 7,
  },
  {
    firstName: "Джесси",
    lastName: "Блэкер",
    position: ROSTER_POSITIONS.defender,
    price: 8,
  },
  {
    firstName: "Евгений",
    lastName: "Аликин",
    position: ROSTER_POSITIONS.goalkeeper,
    price: 10,
  },
]);
