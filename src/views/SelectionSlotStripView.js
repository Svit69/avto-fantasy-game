import { versionAssetUrl } from "../utils/AssetUrlVersioner.js";

export class SelectionSlotStripView {
  render(teamRoster) {
    return `<div class="selection-slot-strip">${this.#renderSlots(teamRoster)}</div>`;
  }

  #renderSlots(teamRoster) {
    return teamRoster.getSlots().map((slot) => this.#renderSlot(slot)).join("");
  }

  #renderSlot(slot) {
    if (!slot.isFilled()) {
      return `<div class="selection-slot is-empty" data-roster-slot="${slot.getIndex()}">${this.#formatPosition(slot.getPosition())}</div>`;
    }

    const player = slot.getPlayer();
    return `
      <div class="selection-slot is-filled" data-roster-slot="${slot.getIndex()}">
        <img src="${versionAssetUrl(player.getTeamLogo())}" alt="" />
        <span>${player.getLastName().toUpperCase()}</span>
        <button type="button" data-remove-slot="${slot.getIndex()}" aria-label="Удалить игрока">×</button>
      </div>
    `;
  }

  #formatPosition(position) {
    const codes = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return codes[position] ?? position;
  }
}
