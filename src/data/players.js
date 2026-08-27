import { PLAYER_NUMBERS } from "./playerNumbers.js";
import { ROSTER_POSITIONS } from "./positions.js";

const teamLogo = "/assets/avto_logo.png";
const team = "Автомобилист";

export const INITIAL_PLAYERS = Object.freeze([
  {
    firstName: "Анатолий", lastName: "Голышев", number: PLAYER_NUMBERS.golyshev,
    position: ROSTER_POSITIONS.forward, price: 6, points: 0, team, teamLogo,
    image: "/assets/players/anatoly_golyshev.png",
  },
  {
    firstName: "Даниэль", lastName: "Спронг", number: PLAYER_NUMBERS.sprong,
    position: ROSTER_POSITIONS.forward, price: 11, points: 0, team, teamLogo,
    image: "/assets/players/daniel_sprong.png",
  },
  {
    firstName: "Никита", lastName: "Трямкин", number: PLAYER_NUMBERS.tryamkin,
    position: ROSTER_POSITIONS.defender, price: 7, points: 0, team, teamLogo,
    image: "/assets/players/nikita_tryamkin.png",
  },
  {
    firstName: "Джесси", lastName: "Блэкер", number: 9,
    position: ROSTER_POSITIONS.defender, price: 8, points: 0, team, teamLogo,
    image: "/assets/players/jesse_blacker.png",
  },
  {
    firstName: "Евгений", lastName: "Аликин", number: PLAYER_NUMBERS.alikin,
    position: ROSTER_POSITIONS.goalkeeper, price: 10, points: 0, team, teamLogo,
    image: "/assets/players/evgeny_alikin.png",
  },
]);
