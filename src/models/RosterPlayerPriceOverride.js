export class RosterPlayerPriceOverride {
  constructor(player, lockedPrice) {
    Object.assign(this, { player, lockedPrice });
  }

  getId() { return this.player.getId(); }
  getFullName() { return this.player.getFullName(); }
  getShortDisplayName() { return this.player.getShortDisplayName(); }
  getLastName() { return this.player.getLastName(); }
  getTeam() { return this.player.getTeam(); }
  getTeamLogo() { return this.player.getTeamLogo(); }
  getPosition() { return this.player.getPosition(); }
  getImage() { return this.player.getImage(); }
  getPoints() { return this.player.getPoints(); }
  getNumber() { return this.player.getNumber(); }
  getPrice() { return this.lockedPrice; }
  getFormattedPrice() { return `${this.lockedPrice}к`; }

  getCardProps(selected) {
    return { ...this.player.getCardProps(selected), price: this.lockedPrice };
  }
}
