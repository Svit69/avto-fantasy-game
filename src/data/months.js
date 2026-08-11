import { SeasonMonth } from "../models/SeasonMonth.js";

export const seasonMonths = [
  new SeasonMonth({ title: "СЕНТЯБРЬ", points: 128, status: "ОЧКОВ" }),
  new SeasonMonth({ title: "ОКТЯБРЬ", points: 96, status: "ОЧКОВ" }),
  new SeasonMonth({
    title: "НОЯБРЬ",
    points: 0,
    status: "СКОРО",
    isLocked: true,
  }),
];
