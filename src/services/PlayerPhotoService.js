const playerPhotoBasePath = "/players/";

export class PlayerPhotoService {
  static buildPublicPhotoUrl(player) {
    return `${playerPhotoBasePath}${player.getPhotoFileName()}`;
  }
}
