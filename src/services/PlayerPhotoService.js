import defaultPhotoUrl from "../assets/default_photo.png";

const playerPhotoBasePath = "/players/";

export class PlayerPhotoService {
  static buildPublicPhotoUrl(player) {
    return `${playerPhotoBasePath}${player.getPhotoFileName()}`;
  }

  static getDefaultPhotoUrl() {
    return defaultPhotoUrl;
  }

  static replaceMissingPhotoWithDefault(photoElement) {
    if (photoElement.dataset.usesDefaultPhoto === "true") {
      photoElement.style.display = "none";
      return;
    }

    photoElement.dataset.usesDefaultPhoto = "true";
    photoElement.src = defaultPhotoUrl;
  }
}
