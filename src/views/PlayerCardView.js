import { versionAssetUrl } from "../utils/AssetUrlVersioner.js";
import { PlayerCardRemoveButtonView } from "./PlayerCardRemoveButtonView.js";

export class PlayerCardView {
  constructor(removeButtonView = new PlayerCardRemoveButtonView()) { this.removeButtonView = removeButtonView; }

  render(props, orderIndex, slotIndex) {
    const tiltClass = this.#selectTiltClass(orderIndex);
    const selectedClass = props.selected ? " is-selected" : "";

    return `
      <article class="player-card ${tiltClass}${selectedClass}" data-player-profile="${props.id}">
        ${this.removeButtonView.render(slotIndex, props.editable)}
        <img class="card-layer card-bottom-layer" src="${versionAssetUrl("/assets/card_bottom_layer.png")}" alt="" loading="eager" decoding="sync" draggable="false" />
        <div class="card-live-layer">
          <div class="card-score-block">
            <div class="card-points">${props.points}</div>
            <div class="card-position">${this.#formatPosition(props.position)}</div>
          </div>
          <img class="card-player-image" src="${versionAssetUrl(props.image)}" alt="${props.name} ${props.secondName}" loading="eager" decoding="async" draggable="false" onerror="this.remove()" />
        </div>
        <img class="card-layer card-top-layer" src="${versionAssetUrl("/assets/card_top_layer.png")}" alt="" loading="eager" decoding="sync" draggable="false" />
        ${this.#renderLeagueLogo(props.leagueLogo)}
        <div class="card-selected-label">ВЫБРАН</div>
        <div class="card-info-stack">
          <div class="card-name">${this.#formatShortName(props)}</div>
          <div class="card-price"><span>${props.price}</span><small>к</small></div>
        </div>
      </article>
    `;
  }

  #formatPosition(position) {
    const codes = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return codes[position] ?? position;
  }

  #formatShortName(props) { return `${props.name.charAt(0)}. ${props.secondName}`.toUpperCase(); }

  #renderLeagueLogo(leagueLogo) {
    return leagueLogo ? `<img class="card-league-logo" src="${versionAssetUrl(leagueLogo)}" alt="Лига игрока" />` : "";
  }

  #selectTiltClass(orderIndex) {
    const variants = ["tilt-left", "tilt-right", "tilt-soft-left"];
    return variants[orderIndex % variants.length];
  }
}
