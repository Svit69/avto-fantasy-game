import { DraftFieldView } from "../views/DraftFieldView.js";
import { DraftLineupView } from "../views/DraftLineupView.js";
import { EmptyPlayerSlotView } from "../views/EmptyPlayerSlotView.js";
import { FilterSheetView } from "../views/FilterSheetView.js";
import { FooterView } from "../views/FooterView.js";
import { PlayerCardView } from "../views/PlayerCardView.js";
import { PlayerMarketTableView } from "../views/PlayerMarketTableView.js";
import { PlayerSelectionDrawerView } from "../views/PlayerSelectionDrawerView.js";
import { SelectionSlotStripView } from "../views/SelectionSlotStripView.js";
import { RosterDomRenderer } from "./RosterDomRenderer.js";
import { RosterSlotDomRenderer } from "./RosterSlotDomRenderer.js";

export class ApplicationViewFactory {
  createRosterDomRenderer(rootElement, teamRoster) {
    const slotRenderer = this.createRosterSlotDomRenderer();
    const draftFieldView = this.createDraftFieldView(slotRenderer);
    return new RosterDomRenderer(rootElement, teamRoster, draftFieldView, new FooterView(), slotRenderer);
  }

  createDraftFieldView(slotRenderer) {
    return new DraftFieldView(new DraftLineupView(slotRenderer));
  }

  createRosterSlotDomRenderer() {
    return new RosterSlotDomRenderer(new PlayerCardView(), new EmptyPlayerSlotView());
  }

  createPlayerSelectionDrawerView() {
    return new PlayerSelectionDrawerView(
      new SelectionSlotStripView(),
      new PlayerMarketTableView(),
      new FilterSheetView(),
    );
  }
}
