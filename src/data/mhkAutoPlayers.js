import { ROSTER_POSITIONS } from "./positions.js";

export function createMhkAutoPlayers(factory) {
  return [
    factory.createMhkAutoPlayer("Герман", "Дудорга", "dudorga", ROSTER_POSITIONS.forward, 7, "german_dudorga"),
    factory.createMhkAutoPlayer("Иван", "Губин", "gubin", ROSTER_POSITIONS.forward, 6, "ivan_gubin"),
    factory.createMhkAutoPlayer("Савелий", "Жиров", "zhirov", ROSTER_POSITIONS.forward, 8, "savely_zhirov"),
    factory.createMhkAutoPlayer("Тимофей", "Никифоров", "nikiforov", ROSTER_POSITIONS.forward, 4, "timofey_nikiforov"),
    factory.createMhkAutoPlayer("Антон", "Лыков", "lykov", ROSTER_POSITIONS.forward, 5, "anton_lykov"),
    factory.createMhkAutoPlayer("Иван", "Плотников", "plotnikov", ROSTER_POSITIONS.forward, 4, "ivan_plotnikov"),
    factory.createMhkAutoPlayer("Леонид", "Иванов", "ivanov", ROSTER_POSITIONS.defender, 5, "leonid_ivanov"),
    factory.createMhkAutoPlayer("Ефим", "Минаев", "minaev", ROSTER_POSITIONS.goalkeeper, 3, "efim_minaev"),
    factory.createMhkAutoPlayer("Сергей", "Соколкин", "sokolkin", ROSTER_POSITIONS.goalkeeper, 8, "sergey_sokolkin"),
    factory.createMhkAutoPlayer("Сергей", "Горбунов", "sergeyGorbunov", ROSTER_POSITIONS.goalkeeper, 5, "sergey_gorbunov"),
  ];
}
