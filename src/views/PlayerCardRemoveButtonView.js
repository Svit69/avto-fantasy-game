export class PlayerCardRemoveButtonView {
  render(slotIndex, editable) {
    const hiddenClass = editable ? "" : " is-hidden";
    const removeData = editable ? `data-remove-slot="${slotIndex}"` : "";
    const disabled = editable ? "" : `disabled aria-hidden="true"`;
    return `<button class="card-remove-button${hiddenClass}" type="button" ${removeData} ${disabled}
      aria-label="Удалить игрока"><span aria-hidden="true">×</span></button>`;
  }
}
