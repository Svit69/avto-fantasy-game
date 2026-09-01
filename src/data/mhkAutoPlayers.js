import { ROSTER_POSITIONS } from "./positions.js";

export function createMhkAutoPlayers(factory) {
  return [
    factory.createMhkAutoPlayer("Герман", "Дудорга", "dudorga", ROSTER_POSITIONS.forward, 7, "german_dudorga"),
    factory.createMhkAutoPlayer("Иван", "Губин", "gubin", ROSTER_POSITIONS.forward, 6, "ivan_gubin"),
    factory.createMhkAutoPlayer("Савелий", "Жиров", "zhirov", ROSTER_POSITIONS.forward, 8, "savely_zhirov"),
    factory.createMhkAutoPlayer("Тимофей", "Никифоров", "nikiforov", ROSTER_POSITIONS.forward, 4, "timofey_nikiforov"),
    factory.createMhkAutoPlayer("Антон", "Лыков", "lykov", ROSTER_POSITIONS.forward, 5, "anton_lykov"),
    factory.createMhkAutoPlayer("Иван", "Плотников", "plotnikov", ROSTER_POSITIONS.forward, 4, "ivan_plotnikov"),
    factory.createMhkAutoPlayer("Игорь", "Козлов", "kozlov", ROSTER_POSITIONS.forward, 3, "igor_kozlov"),
    factory.createMhkAutoPlayer("Максим", "Кривоножкин", "krivonozhkin", ROSTER_POSITIONS.forward, 3, "maxim_krivonozhkin"),
    factory.createMhkAutoPlayer("Александр", "Пимин", "pimin", ROSTER_POSITIONS.forward, 12, "alexander_pimin"),
    factory.createMhkAutoPlayer("Федор", "Казадаев", "kazadaev", ROSTER_POSITIONS.forward, 4, "fedor_kazadaev"),
    factory.createMhkAutoPlayer("Леонид", "Иванов", "ivanov", ROSTER_POSITIONS.defender, 5, "leonid_ivanov"),
    factory.createMhkAutoPlayer("Матвей", "Чумаков", "chumakov", ROSTER_POSITIONS.defender, 3, "matvey_chumakov"),
    factory.createMhkAutoPlayer("Михаил", "Ляжьев", "lyazhev", ROSTER_POSITIONS.defender, 3, "mikhail_lyazhev"),
    factory.createMhkAutoPlayer("Денис", "Банных", "bannykh", ROSTER_POSITIONS.defender, 3, "denis_bannykh"),
    factory.createMhkAutoPlayer("Георгий", "Забудко", "zabudko", ROSTER_POSITIONS.defender, 3, "georgy_zabudko"),
    factory.createMhkAutoPlayer("Андрей", "Мамай", "mamay", ROSTER_POSITIONS.defender, 8, "andrey_mamay"),
    factory.createMhkAutoPlayer("Савелий", "Ивонин", "ivonin", ROSTER_POSITIONS.defender, 6, "savely_ivonin"),
    factory.createMhkAutoPlayer("Ефим", "Минаев", "minaev", ROSTER_POSITIONS.goalkeeper, 3, "efim_minaev"),
    factory.createMhkAutoPlayer("Сергей", "Соколкин", "sokolkin", ROSTER_POSITIONS.goalkeeper, 8, "sergey_sokolkin"),
    factory.createMhkAutoPlayer("Сергей", "Горбунов", "sergeyGorbunov", ROSTER_POSITIONS.goalkeeper, 5, "sergey_gorbunov"),
    factory.createMhkAutoPlayer("Ярослав", "Немытых", "nemytykh", ROSTER_POSITIONS.goalkeeper, 3, "yaroslav_nemytykh"),
  ];
}
