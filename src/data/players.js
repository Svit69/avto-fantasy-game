import { PLAYER_NUMBERS } from "./playerNumbers.js";
import { ROSTER_POSITIONS } from "./positions.js";

const avtoLogo = "/assets/avto_logo.png", gornyakLogo = "/assets/gornyak_logo.png", vhlLogo = "/assets/vhl_logo.svg";
const avtoTeam = "Автомобилист", gornyakTeam = "Горняк-УГМК";

function createPlayer(firstName, lastName, key, position, price, imageName, team = avtoTeam, teamLogo = avtoLogo, leagueLogo = "") {
  return { firstName, lastName, number: PLAYER_NUMBERS[key],
    position, price, points: 0, team, teamLogo, leagueLogo, image: `/assets/players/${imageName}.png` };
}

function createGornyakPlayer(firstName, lastName, key, position, price, imageName) {
  return createPlayer(firstName, lastName, key, position, price, imageName, gornyakTeam, gornyakLogo, vhlLogo);
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
  createPlayer("Александр", "Шаров", "sharov", ROSTER_POSITIONS.forward, 14, "alexander_sharov"),
  createPlayer("Роман", "Горбунов", "gorbunov", ROSTER_POSITIONS.forward, 17, "roman_gorbunov"),
  createPlayer("Никита", "Шашков", "shashkov", ROSTER_POSITIONS.forward, 14, "nikita_shashkov"),
  createPlayer("Егор", "Черников", "chernikov", ROSTER_POSITIONS.forward, 11, "egor_chernikov"),
  createGornyakPlayer("Егор", "Алексеев", "alekseev", ROSTER_POSITIONS.forward, 8, "egor_alekseev"),
  createGornyakPlayer("Степан", "Борисов", "borisov", ROSTER_POSITIONS.forward, 7, "stepan_borisov"),
  createGornyakPlayer("Максим", "Великов", "velikov", ROSTER_POSITIONS.forward, 8, "maxim_velikov"),
  createGornyakPlayer("Лавр", "Гашилов", "gashilov", ROSTER_POSITIONS.forward, 9, "lavr_gashilov"),
  createGornyakPlayer("Владислав", "Демидович", "demidovich", ROSTER_POSITIONS.forward, 8, "vladislav_demidovich"),
  createGornyakPlayer("Илья", "Епищев", "epishev", ROSTER_POSITIONS.forward, 8, "ilya_epishev"),
  createPlayer("Никита", "Трямкин", "tryamkin", ROSTER_POSITIONS.defender, 17, "nikita_tryamkin"),
  createPlayer("Джордан", "Гросс", "gross", ROSTER_POSITIONS.defender, 17, "jordan_gross"),
  createPlayer("Илья", "Карпухин", "karpukhin", ROSTER_POSITIONS.defender, 16, "ilya_karpukhin"),
  createPlayer("Джесси", "Блэкер", "blacker", ROSTER_POSITIONS.defender, 18, "jesse_blacker"),
  createPlayer("Кейл", "Клэг", "clague", ROSTER_POSITIONS.defender, 20, "kael_clague"),
  createPlayer("Кирилл", "Воробьев", "vorobyev", ROSTER_POSITIONS.defender, 14, "kirill_vorobyev"),
  createPlayer("Ярослав", "Бусыгин", "busygin", ROSTER_POSITIONS.defender, 15, "yaroslav_busygin"),
  createPlayer("Дмитрий", "Юдин", "yudin", ROSTER_POSITIONS.defender, 14, "dmitry_yudin"),
  createGornyakPlayer("Дмитрий", "Бойков", "boykov", ROSTER_POSITIONS.defender, 6, "dmitry_boykov"),
  createGornyakPlayer("Михаил", "Гамзаков", "gamzakov", ROSTER_POSITIONS.defender, 10, "mikhail_gamzakov"),
  createGornyakPlayer("Николай", "Думченко", "dumchenko", ROSTER_POSITIONS.defender, 6, "nikolay_dumchenko"),
  createPlayer("Евгений", "Аликин", "alikin", ROSTER_POSITIONS.goalkeeper, 20, "evgeny_alikin"),
  createPlayer("Владимир", "Галкин", "galkin", ROSTER_POSITIONS.goalkeeper, 20, "vladimir_galkin"),
]);
