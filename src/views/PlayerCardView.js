export class PlayerCardView {
  render(props, orderIndex) {
    const tiltClass = this.#selectTiltClass(orderIndex);
    const selectedClass = props.selected ? " is-selected" : "";

    return `
      <article class="player-card ${tiltClass}${selectedClass}">
        <img class="card-layer card-bottom-layer"
          src="/assets/card_bottom_layer.png" alt="" />
        <div class="card-live-layer">
          <img class="card-team-logo" src="${props.teamLogo}" alt="${props.team}" />
          <div class="card-points">${props.points}</div>
          <img class="card-player-image" src="${props.image}"
            alt="${props.name} ${props.secondName}" onerror="this.remove()" />
          <div class="card-position">${this.#formatPosition(props.position)}</div>
        </div>
        <img class="card-layer card-top-layer"
          src="/assets/card_top_layer.png" alt="" />
        <div class="card-selected-label">ВЫБРАН</div>
        <div class="card-name">${props.name.charAt(0)}. ${props.secondName}</div>
        <div class="card-price">${props.price}M</div>
      </article>
    `;
  }

  #formatPosition(position) {
    const codes = { нападающий: "НАП", защитник: "ЗАЩ", вратарь: "ВРТ" };
    return codes[position] ?? position;
  }

  #selectTiltClass(orderIndex) {
    const variants = ["tilt-left", "tilt-right", "tilt-soft-left"];
    return variants[orderIndex % variants.length];
  }
}
