export class PlayerCardView {
  render(props, orderIndex) {
    const tiltClass = this.#selectTiltClass(orderIndex);
    const selectedClass = props.selected ? " is-selected" : "";

    return `
      <article class="player-card ${tiltClass}${selectedClass}">
        <img class="card-layer card-bottom-layer" src="/assets/card_bottom_layer.png" alt="" />
        <div class="card-live-layer">
          <div class="card-score-block">
            <div class="card-points">${props.points}</div>
            <div class="card-position">${this.#formatPosition(props.position)}</div>
          </div>
          <img class="card-player-image" src="${props.image}" alt="${props.name} ${props.secondName}" onerror="this.remove()" />
        </div>
        <img class="card-layer card-top-layer" src="/assets/card_top_layer.png" alt="" />
        <div class="card-selected-label">ВЫБРАН</div>
        <div class="card-info-stack">
          <div class="card-name">${this.#formatShortName(props)}</div>
          <div class="card-price">${props.price}M</div>
        </div>
      </article>
    `;
  }

  #formatPosition(position) {
    const codes = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return codes[position] ?? position;
  }

  #formatShortName(props) {
    return `${props.name.charAt(0)}. ${props.secondName}`.toUpperCase();
  }

  #selectTiltClass(orderIndex) {
    const variants = ["tilt-left", "tilt-right", "tilt-soft-left"];
    return variants[orderIndex % variants.length];
  }
}
