import { Club } from "../models/Club.js";
import avtoLogoUrl from "../assets/avto_logo.png";
import avtoJerseyUrl from "../assets/avtomobilist_jersey.png";
import gornyakLogoUrl from "../assets/gornyak_logo.png";
import gornyakJerseyUrl from "../assets/gornyak_jersey.png";

export const clubs = {
  automobilist: new Club({
    id: "automobilist",
    name: "Автомобилист",
    logoUrl: avtoLogoUrl,
    jerseyUrl: avtoJerseyUrl,
    league: "КХЛ",
  }),
  gornyak: new Club({
    id: "gornyak",
    name: "Горняк-УГМК",
    logoUrl: gornyakLogoUrl,
    jerseyUrl: gornyakJerseyUrl,
    league: "КХЛ",
  }),
};
