export class OnlineMatchSourcePolicy {
  isOnline(match) { return ["khl-online", "mhl-online"].includes(match?.sourceType); }
}
