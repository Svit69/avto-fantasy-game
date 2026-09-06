import { AssetImageView } from "./AssetImageView.js";

export class PlayerMarketRowView {
  constructor(imageView = new AssetImageView()) { this.imageView = imageView; }

  render(player, selectedIds, teamRoster) {
    const selected = selectedIds.includes(player.getId());
    const clubLocked = !selected && !teamRoster.canSelectPlayerFromClub(null, player);
    const slotMissing = !teamRoster.findAvailableSlotForPlayer(null, player);
    const disabled = selected || !player.isAvailableForSelection() || (slotMissing && !clubLocked);
    const classes = this.#createClassName(selected, !selected && (disabled || clubLocked));
    return `<button class="${classes}" type="button" data-select-player="${player.getId()}"
      data-player-profile="${player.getId()}" ${clubLocked ? `data-club-limit-team="${player.getTeam()}"` : ""}
      ${disabled ? `aria-disabled="true"` : ""}>
      <div class="market-player-cell">
        <span class="market-player-avatar">${this.#renderAvatar(player)}${selected ? "<i>✓</i>" : ""}</span>
        <span><b>${player.getLastName().toUpperCase()}</b><small>${player.getTeam().toUpperCase()}</small></span>
      </div>
      <div class="market-stats-scroll">
        <span><b>${player.getFormattedPrice()}</b><small>${this.#formatPosition(player.getPosition())}</small></span>
        <span>${player.getPoints()}</span><span>${player.getSelectionPercent()}%</span><span>0</span><span>0</span>
      </div>
    </button>`;
  }

  #createClassName(selected, inactive) {
    return `market-row ${selected ? "is-selected" : ""} ${inactive ? "is-disabled" : ""}`;
  }

  #formatPosition(position) {
    const codes = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return codes[position] ?? position;
  }

  #renderAvatar(player) {
    return this.imageView.renderPlayerImage({ src: player.getImage(), alt: player.getFullName() });
  }
}
