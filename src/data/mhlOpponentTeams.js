const mhlLogoPath = "/assets/mhl_logo.svg";
const buildMhlOpponentTeam = (id, name, shortName, logoPath = mhlLogoPath) => ({ id, name, shortName, logoPath });

export const MHL_OPPONENT_TEAMS = [
  buildMhlOpponentTeam("mhk-auto", "МХК Авто", "АВТ", "/assets/avto_logo.png"),
  buildMhlOpponentTeam("mhk-spartak", "МХК Спартак", "СПА"),
  buildMhlOpponentTeam("ska-1946", "СКА-1946", "СКА"),
  buildMhlOpponentTeam("irbis", "Ирбис", "ИРБ"),
  buildMhlOpponentTeam("academy-ska", "Академия СКА", "АСК"),
  buildMhlOpponentTeam("krasnaya-armiya", "Красная Армия", "КРА"),
  buildMhlOpponentTeam("sputnik", "Спутник", "СПУ"),
  buildMhlOpponentTeam("chaika", "Чайка", "ЧАЙ"),
  buildMhlOpponentTeam("reaktor", "Реактор", "РЕА"),
  buildMhlOpponentTeam("belye-medvedi", "Белые Медведи", "БМД"),
  buildMhlOpponentTeam("tolpar", "Толпар", "ТОЛ"),
  buildMhlOpponentTeam("stalnye-lisy", "Стальные Лисы", "СТЛ"),
  buildMhlOpponentTeam("loko", "Локо", "ЛОК"),
  buildMhlOpponentTeam("krasnoyarskie-rysi", "Красноярские Рыси", "КРР"),
  buildMhlOpponentTeam("omskie-yastreby", "Омские Ястребы", "ОМЯ"),
  buildMhlOpponentTeam("sibirskie-snaypery", "Сибирские Снайперы", "ССН"),
  buildMhlOpponentTeam("loko-76", "Локо-76", "Л76"),
  buildMhlOpponentTeam("akm-junior", "АКМ-Юниор", "АКМ"),
  buildMhlOpponentTeam("kuznetskie-medvedi", "Кузнецкие Медведи", "КМД"),
  buildMhlOpponentTeam("mamonty-yugry", "Мамонты Югры", "МЮГ"),
  buildMhlOpponentTeam("mhk-molot", "МХК Молот", "МОЛ"),
  buildMhlOpponentTeam("snezhnye-barsy", "Снежные Барсы", "СБА"),
];
