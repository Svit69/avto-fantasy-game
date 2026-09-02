import { ROSTER_POSITIONS } from "./positions.js";

export function createAvtomobilistPlayers(factory) {
  return [
    factory.createAvtomobilistPlayer("Анатолий", "Голышев", "golyshev", ROSTER_POSITIONS.forward, 17, "anatoly_golyshev"),
    factory.createAvtomobilistPlayer("Даниэль", "Спронг", "sprong", ROSTER_POSITIONS.forward, 22, "daniel_sprong"),
    factory.createAvtomobilistPlayer("Максим", "Денежкин", "denezhkin", ROSTER_POSITIONS.forward, 15, "maxim_denezhkin"),
    factory.createAvtomobilistPlayer("Данил", "Гущин", "gushchin", ROSTER_POSITIONS.forward, 17, "danil_gushchin"),
    factory.createAvtomobilistPlayer("Александр", "Кадейкин", "kadeykin", ROSTER_POSITIONS.forward, 14, "alexander_kadeykin"),
    factory.createAvtomobilistPlayer("Артём", "Каштанов", "kashtanov", ROSTER_POSITIONS.forward, 10, "artem_kashtanov"),
    factory.createAvtomobilistPlayer("Максим", "Тарасов", "tarasov", ROSTER_POSITIONS.forward, 10, "maxim_tarasov"),
    factory.createAvtomobilistPlayer("Антон", "Слепышев", "slepyshev", ROSTER_POSITIONS.forward, 15, "anton_slepyshev"),
    factory.createAvtomobilistPlayer("Александр", "Барабанов", "barabanov", ROSTER_POSITIONS.forward, 20, "alexander_barabanov"),
    factory.createAvtomobilistPlayer("Адам", "Ружичка", "ruzicka", ROSTER_POSITIONS.forward, 20, "adam_ruzicka"),
    factory.createAvtomobilistPlayer("Александр", "Шаров", "sharov", ROSTER_POSITIONS.forward, 14, "alexander_sharov"),
    factory.createAvtomobilistPlayer("Роман", "Горбунов", "gorbunov", ROSTER_POSITIONS.forward, 17, "roman_gorbunov"),
    factory.createAvtomobilistPlayer("Никита", "Шашков", "shashkov", ROSTER_POSITIONS.forward, 14, "nikita_shashkov"),
    factory.createAvtomobilistPlayer("Егор", "Черников", "chernikov", ROSTER_POSITIONS.forward, 11, "egor_chernikov"),
    factory.createAvtomobilistPlayer("Никита", "Трямкин", "tryamkin", ROSTER_POSITIONS.defender, 17, "nikita_tryamkin", { khl_player_id: "17594" }),
    factory.createAvtomobilistPlayer("Джордан", "Гросс", "gross", ROSTER_POSITIONS.defender, 17, "jordan_gross"),
    factory.createAvtomobilistPlayer("Илья", "Карпухин", "karpukhin", ROSTER_POSITIONS.defender, 16, "ilya_karpukhin"),
    factory.createAvtomobilistPlayer("Джесси", "Блэкер", "blacker", ROSTER_POSITIONS.defender, 18, "jesse_blacker"),
    factory.createAvtomobilistPlayer("Кейл", "Клэг", "clague", ROSTER_POSITIONS.defender, 20, "kael_clague"),
    factory.createAvtomobilistPlayer("Кирилл", "Воробьев", "vorobyev", ROSTER_POSITIONS.defender, 14, "kirill_vorobyev"),
    factory.createAvtomobilistPlayer("Ярослав", "Бусыгин", "busygin", ROSTER_POSITIONS.defender, 15, "yaroslav_busygin"),
    factory.createAvtomobilistPlayer("Дмитрий", "Юдин", "yudin", ROSTER_POSITIONS.defender, 14, "dmitry_yudin"),
    factory.createAvtomobilistPlayer("Евгений", "Аликин", "alikin", ROSTER_POSITIONS.goalkeeper, 20, "evgeny_alikin"),
    factory.createAvtomobilistPlayer("Владимир", "Галкин", "galkin", ROSTER_POSITIONS.goalkeeper, 20, "vladimir_galkin"),
  ];
}
