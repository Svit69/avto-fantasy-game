export class PlayerRemovalInteraction {
  static removeByClick(event, player, onPlayerRemove) {
    event.stopPropagation();
    onPlayerRemove(player.getId());
  }

  static removeByKeyboard(event, player, onPlayerRemove) {
    if (event.key === "Enter" || event.key === " ") {
      this.removeByClick(event, player, onPlayerRemove);
    }
  }
}
