import { AdminAccessPolicy } from "./AdminAccessPolicy.js";
import { AdminPanelRouteHandler } from "./AdminPanelRouteHandler.js";
import { AdminPlayerMutationService } from "./AdminPlayerMutationService.js";
import { AdminProtocolImportService } from "./AdminProtocolImportService.js";
import { AdminRouteParser } from "./AdminRouteParser.js";
import { AdminViewContextFactory } from "./AdminViewContextFactory.js";
import { AdminVhlOnlineRouteHandler } from "./AdminVhlOnlineRouteHandler.js";
import { KhlServiceFactory } from "./KhlServiceFactory.js";
import { ServerNotificationFactory } from "./ServerNotificationFactory.js";
import { TelegramAdminPanelController } from "./TelegramAdminPanelController.js";
import { VhlOnlineAdminView } from "./VhlOnlineAdminView.js";
import { VhlOnlineMatchCatalog } from "./VhlOnlineMatchCatalog.js";
import { VhlOnlineProtocolRegistrationService } from "./VhlOnlineProtocolRegistrationService.js";

export class TelegramAdminPanelFactory {
  constructor({ rootDirectory, logger }) { Object.assign(this, { rootDirectory, logger }); }

  createAdminPanel({ botClient, userRepository, playerCatalogRepository, rosterRepository, calendarRepository }) {
    const context = new AdminViewContextFactory().createViewContext();
    const mutationService = this.#createMutationService(context.view, botClient, userRepository, rosterRepository, playerCatalogRepository);
    const routeHandler = new AdminPanelRouteHandler({ ...context, userRepository, playerCatalogRepository, rosterRepository, mutationService,
      protocolImportService: this.#createProtocolImportService(botClient, context, calendarRepository), vhlOnlineRouteHandler: this.#createVhlRouteHandler(context, calendarRepository) });
    return new TelegramAdminPanelController({ accessPolicy: new AdminAccessPolicy((process.env.TELEGRAM_ADMIN_IDS || "").split(",")),
      routeParser: new AdminRouteParser(), routeHandler, stateStore: context.stateStore, botClient, logger: this.logger });
  }

  #createMutationService(view, botClient, userRepository, rosterRepository, playerCatalogRepository) {
    const notifications = new ServerNotificationFactory(this.rootDirectory, botClient, this.logger).createRosterChangeNotificationService(userRepository, rosterRepository);
    return new AdminPlayerMutationService({ view, playerCatalogRepository, rosterChangeNotifications: notifications });
  }

  #createProtocolImportService(botClient, context, calendarRepository) {
    return new AdminProtocolImportService({ botClient, khlServiceFactory: new KhlServiceFactory(this.rootDirectory), protocolView: context.protocolView,
      logger: this.logger, stateStore: context.stateStore, calendarRepository });
  }

  #createVhlRouteHandler(context, calendarRepository) {
    const view = new VhlOnlineAdminView();
    return new AdminVhlOnlineRouteHandler({ view, matchCatalog: new VhlOnlineMatchCatalog(calendarRepository),
      registrationService: new VhlOnlineProtocolRegistrationService({ calendarRepository, view }), stateStore: context.stateStore, fallbackView: context.view });
  }
}
