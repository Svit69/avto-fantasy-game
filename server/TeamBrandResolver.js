export class TeamBrandResolver {
  resolveTeamAssets(teamName) {
    if (teamName === "МХК Авто") {
      return { teamLogo: "/assets/avto_logo.png", league: "МХЛ", leagueLogo: "/assets/mhl_logo.svg" };
    }

    if (teamName === "Горняк-УГМК") {
      return { teamLogo: "/assets/gornyak_logo.png", league: "ВХЛ", leagueLogo: "/assets/vhl_logo.svg" };
    }

    return { teamLogo: "/assets/avto_logo.png", league: "КХЛ", leagueLogo: "" };
  }
}
