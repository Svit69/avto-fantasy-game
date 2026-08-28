import { ROSTER_POSITIONS } from "./positions.js";

export function createGornyakPlayers(factory) {
  return [
    factory.createGornyakPlayer("Егор", "Алексеев", "alekseev", ROSTER_POSITIONS.forward, 8, "egor_alekseev"),
    factory.createGornyakPlayer("Степан", "Борисов", "borisov", ROSTER_POSITIONS.forward, 7, "stepan_borisov"),
    factory.createGornyakPlayer("Максим", "Великов", "velikov", ROSTER_POSITIONS.forward, 8, "maxim_velikov"),
    factory.createGornyakPlayer("Лавр", "Гашилов", "gashilov", ROSTER_POSITIONS.forward, 9, "lavr_gashilov"),
    factory.createGornyakPlayer("Владислав", "Демидович", "demidovich", ROSTER_POSITIONS.forward, 8, "vladislav_demidovich"),
    factory.createGornyakPlayer("Илья", "Епищев", "epishev", ROSTER_POSITIONS.forward, 8, "ilya_epishev"),
    factory.createGornyakPlayer("Олег", "Зайцев", "zaytsev", ROSTER_POSITIONS.forward, 9, "oleg_zaytsev"),
    factory.createGornyakPlayer("Дмитрий", "Исаев", "isaev", ROSTER_POSITIONS.forward, 8, "dmitry_isaev"),
    factory.createGornyakPlayer("Дмитрий", "Бойков", "boykov", ROSTER_POSITIONS.defender, 6, "dmitry_boykov"),
    factory.createGornyakPlayer("Михаил", "Гамзаков", "gamzakov", ROSTER_POSITIONS.defender, 10, "mikhail_gamzakov"),
    factory.createGornyakPlayer("Николай", "Думченко", "dumchenko", ROSTER_POSITIONS.defender, 6, "nikolay_dumchenko"),
    factory.createGornyakPlayer("Юрий", "Журавлев", "zhuravlev", ROSTER_POSITIONS.defender, 11, "yury_zhuravlev"),
    factory.createGornyakPlayer("Лоренс", "Зинаддин", "zinaddin", ROSTER_POSITIONS.goalkeeper, 11, "lorens_zinaddin"),
  ];
}
