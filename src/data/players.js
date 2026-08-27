import { PLAYER_NUMBERS } from "./playerNumbers.js";
import { ROSTER_POSITIONS } from "./positions.js";

const teamLogo = "/assets/avto_logo.png";
const team = "Автомобилист";

function createPlayer(firstName, lastName, key, position, price, imageName) {
  return { firstName, lastName, number: PLAYER_NUMBERS[key],
    position, price, points: 0, team, teamLogo, image: `/assets/players/${imageName}.png` };
}

export const INITIAL_PLAYERS = Object.freeze([
  createPlayer("Анатолий", "Голышев", "golyshev", ROSTER_POSITIONS.forward, 17, "anatoly_golyshev"),
  createPlayer("Даниэль", "Спронг", "sprong", ROSTER_POSITIONS.forward, 22, "daniel_sprong"),
  createPlayer("Максим", "Денежкин", "denezhkin", ROSTER_POSITIONS.forward, 15, "maxim_denezhkin"),
  createPlayer("Данил", "Гущин", "gushchin", ROSTER_POSITIONS.forward, 17, "danil_gushchin"),
  createPlayer("Александр", "Кадейкин", "kadeykin", ROSTER_POSITIONS.forward, 14, "alexander_kadeykin"),
  createPlayer("Артём", "Каштанов", "kashtanov", ROSTER_POSITIONS.forward, 10, "artem_kashtanov"),
  createPlayer("Максим", "Тарасов", "tarasov", ROSTER_POSITIONS.forward, 10, "maxim_tarasov"),
  createPlayer("Антон", "Слепышев", "slepyshev", ROSTER_POSITIONS.forward, 15, "anton_slepyshev"),
  createPlayer("Александр", "Барабанов", "barabanov", ROSTER_POSITIONS.forward, 20, "alexander_barabanov"),
  createPlayer("Адам", "Ружичка", "ruzicka", ROSTER_POSITIONS.forward, 20, "adam_ruzicka"),
  createPlayer("Егор", "Черников", "chernikov", ROSTER_POSITIONS.forward, 5, "egor_chernikov"),
  createPlayer("Никита", "Трямкин", "tryamkin", ROSTER_POSITIONS.defender, 17, "nikita_tryamkin"),
  createPlayer("Кейл", "Клэг", "clague", ROSTER_POSITIONS.defender, 20, "kael_clague"),
  createPlayer("Кирилл", "Воробьев", "vorobyev", ROSTER_POSITIONS.defender, 14, "kirill_vorobyev"),
  createPlayer("Ярослав", "Бусыгин", "busygin", ROSTER_POSITIONS.defender, 15, "yaroslav_busygin"),
  createPlayer("Дмитрий", "Юдин", "yudin", ROSTER_POSITIONS.defender, 14, "dmitry_yudin"),
  createPlayer("Евгений", "Аликин", "alikin", ROSTER_POSITIONS.goalkeeper, 10, "evgeny_alikin"),
  createPlayer("Владимир", "Галкин", "galkin", ROSTER_POSITIONS.goalkeeper, 10, "vladimir_galkin"),
]);
