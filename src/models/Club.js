import { FantasyEntity } from "./FantasyEntity.js";

export class Club extends FantasyEntity {
  #logoUrl;
  #jerseyUrl;
  #league;

  constructor({ id, name, logoUrl, jerseyUrl, league }) {
    super(id, name);
    this.#logoUrl = logoUrl;
    this.#jerseyUrl = jerseyUrl;
    this.#league = league;
  }

  getLogoUrl() {
    return this.#logoUrl;
  }

  getJerseyUrl() {
    return this.#jerseyUrl;
  }

  getLeague() {
    return this.#league;
  }
}
