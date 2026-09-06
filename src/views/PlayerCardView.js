import { AssetImageView } from "./AssetImageView.js";
import { PlayerCardRemoveButtonView } from "./PlayerCardRemoveButtonView.js";
export class PlayerCardView {
  constructor(removeButtonView = new PlayerCardRemoveButtonView(), imageView = new AssetImageView()) {
    Object.assign(this, { removeButtonView, imageView });
  }
  render(props, orderIndex, slotIndex) {
    const tiltClass = this.#selectTiltClass(orderIndex);
    const selectedClass = props.selected ? " is-selected" : "";
    const shortName = this.#formatShortName(props);
    const nameFitClass = this.#selectNameFitClass(shortName);
    return `
      <article class="player-card ${tiltClass}${selectedClass}" data-player-profile="${props.id}">
        ${this.removeButtonView.render(slotIndex, props.editable)}
        ${this.imageView.renderAsset({ className: "card-layer card-bottom-layer", src: "/assets/card_bottom_layer.png", loading: "eager", decoding: "sync", priority: "high" })}
        <div class="card-live-layer">
          <div class="card-score-block">
            <div class="card-points">${props.points}</div>
            <div class="card-position">${this.#formatPosition(props.position)}</div>
          </div>
          ${this.imageView.renderPlayerImage({ className: "card-player-image", src: props.image, alt: `${props.name} ${props.secondName}`, loading: "eager", priority: "high" })}
        </div>
        ${this.imageView.renderAsset({ className: "card-layer card-top-layer", src: "/assets/card_top_layer.png", loading: "eager", decoding: "sync", priority: "high" })}
        ${this.#renderLeagueLogo(props.leagueLogo)}
        <div class="card-selected-label">ВЫБРАН</div>
        <div class="card-info-stack">
          <div class="card-name ${nameFitClass}">${shortName}</div>
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
    return leagueLogo ? this.imageView.renderAsset({ className: "card-league-logo", src: leagueLogo, alt: "Лига игрока" }) : "";
  }
  #selectNameFitClass(shortName) { return shortName.length >= 15 ? "is-long-name" : ""; }
  #selectTiltClass(orderIndex) {
    const variants = ["tilt-left", "tilt-right", "tilt-soft-left"];
    return variants[orderIndex % variants.length];
  }
}
