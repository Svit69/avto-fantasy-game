import path from "node:path";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { AdminAccessPolicy } from "./AdminAccessPolicy.js"; import { AdminConversationStateStore } from "./AdminConversationStateStore.js"; import { AdminKeyboardFactory } from "./AdminKeyboardFactory.js"; import { AdminProtocolPanelView } from "./AdminProtocolPanelView.js";
import { AdminPanelRouteHandler } from "./AdminPanelRouteHandler.js"; import { AdminPanelView } from "./AdminPanelView.js"; import { AdminPlayerMutationService } from "./AdminPlayerMutationService.js"; import { AdminRouteParser } from "./AdminRouteParser.js";
import { CalendarStorageFactory } from "./CalendarStorageFactory.js"; import { FantasyCalendarController } from "./FantasyCalendarController.js";
import { HealthController } from "./HealthController.js"; import { HttpApplication } from "./HttpApplication.js"; import { HttpRequestLogger } from "./HttpRequestLogger.js"; import { JsonResponder } from "./JsonResponder.js";
import { KhlManualImportController } from "./KhlManualImportController.js"; import { KhlMatchDataController } from "./KhlMatchDataController.js"; import { KhlMatchDataRepository } from "./KhlMatchDataRepository.js"; import { KhlServiceFactory } from "./KhlServiceFactory.js"; import { AdminProtocolImportService } from "./AdminProtocolImportService.js";
import { OpponentTeamController } from "./OpponentTeamController.js"; import { PlayerCatalogController } from "./PlayerCatalogController.js"; import { PlayerSelectionStatsController } from "./PlayerSelectionStatsController.js"; import { PlayerCatalogRepository } from "./PlayerCatalogRepository.js"; import { RequestBodyParser } from "./RequestBodyParser.js";
import { RosterController } from "./RosterController.js"; import { RosterDeadlineGuard } from "./RosterDeadlineGuard.js"; import { RosterRepository } from "./RosterRepository.js"; import { RosterSlotPriceLocker } from "./RosterSlotPriceLocker.js";
import { StaticFileServer } from "./StaticFileServer.js"; import { StandingsController } from "./StandingsController.js"; import { TelegramAdminPanelController } from "./TelegramAdminPanelController.js"; import { TelegramAuthController } from "./TelegramAuthController.js";
import { TelegramBotClient } from "./TelegramBotClient.js"; import { TelegramBotInfoController } from "./TelegramBotInfoController.js"; import { TelegramInitDataVerifier } from "./TelegramInitDataVerifier.js";
import { TelegramUserMapper } from "./TelegramUserMapper.js"; import { TelegramWebhookController } from "./TelegramWebhookController.js"; import { TelegramWebhookInstaller } from "./TelegramWebhookInstaller.js";
import { TelegramWebhookInfoController } from "./TelegramWebhookInfoController.js"; import { TelegramWebhookReplyFactory } from "./TelegramWebhookReplyFactory.js"; import { TelegramUpdateSummarizer } from "./TelegramUpdateSummarizer.js";
import { TeamBrandResolver } from "./TeamBrandResolver.js"; import { UserRepository } from "./UserRepository.js"; import { ServerNotificationFactory } from "./ServerNotificationFactory.js";
export class ServerApplicationFactory {
  constructor(rootDirectory, logger) { Object.assign(this, { rootDirectory, logger }); }
  createApplication() {
    const base = this.#createBaseDependencies(); const storage = this.#createStorageDependencies(base); return new HttpApplication(this.#createControllers(base, storage));
  }
  #createBaseDependencies() {
    const bodyParser = new RequestBodyParser(); const jsonResponder = new JsonResponder();
    const botClient = new TelegramBotClient(process.env.TELEGRAM_BOT_TOKEN, this.logger, Number(process.env.TELEGRAM_API_TIMEOUT_MS || 15000));
    const appUrl = process.env.TELEGRAM_WEB_APP_URL || `http://localhost:${Number(process.env.PORT || 3000)}`; return { bodyParser, jsonResponder, botClient, appUrl, initDataVerifier: new TelegramInitDataVerifier(process.env.TELEGRAM_BOT_TOKEN) };
  }
  #createStorageDependencies(base) {
    const khlServiceFactory = new KhlServiceFactory(this.rootDirectory); const userRepository = new UserRepository(this.#resolveStoragePath(process.env.USER_DATABASE_PATH || "storage/users.json"));
    const playerCatalogRepository = new PlayerCatalogRepository(this.#resolveStoragePath(process.env.PLAYER_DATABASE_PATH || "storage/players.json"), INITIAL_PLAYERS, new TeamBrandResolver());
    const calendarStorage = new CalendarStorageFactory((filePath) => this.#resolveStoragePath(filePath)); const calendarRepository = calendarStorage.createCalendarRepository(); const opponentTeamRepository = calendarStorage.createOpponentTeamRepository();
    const rosterRepository = new RosterRepository(this.#resolveStoragePath(process.env.ROSTER_DATABASE_PATH || "storage/rosters.json")); const khlMatchDataRepository = new KhlMatchDataRepository(this.#resolveStoragePath(process.env.KHL_DATABASE_PATH || "storage/khl-match-data.json"));
    return { userMapper: new TelegramUserMapper(), userRepository, playerCatalogRepository, calendarRepository, opponentTeamRepository, rosterRepository, khlMatchDataRepository, khlServiceFactory, priceLocker: new RosterSlotPriceLocker(playerCatalogRepository), adminPanel: this.#createAdminPanel(base.botClient, userRepository, playerCatalogRepository, rosterRepository) };
  }
  #createControllers(base, storage) {
    return { jsonResponder: base.jsonResponder, logger: this.logger, staticFileServer: new StaticFileServer(this.rootDirectory),
      requestLogger: new HttpRequestLogger(this.logger), authController: new TelegramAuthController({ ...base, ...storage }),
      webhookController: new TelegramWebhookController({ ...base, ...storage, logger: this.logger, summarizer: new TelegramUpdateSummarizer(), replyFactory: new TelegramWebhookReplyFactory() }),
      webhookInstaller: new TelegramWebhookInstaller({ jsonResponder: base.jsonResponder, botClient: base.botClient, webhookUrl: process.env.TELEGRAM_WEBHOOK_URL, logger: this.logger }),
      webhookInfo: new TelegramWebhookInfoController({ jsonResponder: base.jsonResponder, botClient: base.botClient }), botInfo: new TelegramBotInfoController({ jsonResponder: base.jsonResponder, botClient: base.botClient }), khlMatchDataController: new KhlMatchDataController({ jsonResponder: base.jsonResponder, repository: storage.khlMatchDataRepository }), khlManualImportController: new KhlManualImportController({ bodyParser: base.bodyParser, jsonResponder: base.jsonResponder, serviceFactory: storage.khlServiceFactory }),
      healthController: new HealthController({ jsonResponder: base.jsonResponder, botClient: base.botClient, webhookUrl: process.env.TELEGRAM_WEBHOOK_URL }), calendarController: new FantasyCalendarController({ jsonResponder: base.jsonResponder, calendarRepository: storage.calendarRepository, opponentTeamRepository: storage.opponentTeamRepository }),
      opponentTeamController: new OpponentTeamController({ jsonResponder: base.jsonResponder, opponentTeamRepository: storage.opponentTeamRepository }),
      playerCatalogController: new PlayerCatalogController({ jsonResponder: base.jsonResponder, playerCatalogRepository: storage.playerCatalogRepository }), playerSelectionStatsController: new PlayerSelectionStatsController({ jsonResponder: base.jsonResponder, initDataVerifier: base.initDataVerifier, rosterRepository: storage.rosterRepository }),
      rosterController: new RosterController({ bodyParser: base.bodyParser, jsonResponder: base.jsonResponder, initDataVerifier: base.initDataVerifier, rosterRepository: storage.rosterRepository, priceLocker: storage.priceLocker, deadlineGuard: new RosterDeadlineGuard(storage.calendarRepository) }), standingsController: new StandingsController({ jsonResponder: base.jsonResponder, initDataVerifier: base.initDataVerifier, userRepository: storage.userRepository, rosterRepository: storage.rosterRepository, playerCatalogRepository: storage.playerCatalogRepository }) };
  }
  #createAdminPanel(botClient, userRepository, playerCatalogRepository, rosterRepository) {
    const stateStore = new AdminConversationStateStore(); const keyboardFactory = new AdminKeyboardFactory(); const view = new AdminPanelView(keyboardFactory); const protocolView = new AdminProtocolPanelView(keyboardFactory);
    const rosterChangeNotifications = new ServerNotificationFactory(this.rootDirectory, botClient, this.logger).createRosterChangeNotificationService(userRepository, rosterRepository); const mutationService = new AdminPlayerMutationService({ view, playerCatalogRepository, rosterChangeNotifications });
    const protocolImportService = new AdminProtocolImportService({ botClient, khlServiceFactory: new KhlServiceFactory(this.rootDirectory), protocolView, logger: this.logger, stateStore }); const routeHandler = new AdminPanelRouteHandler({ view, protocolView, stateStore, userRepository, playerCatalogRepository, mutationService, protocolImportService });
    return new TelegramAdminPanelController({ accessPolicy: new AdminAccessPolicy((process.env.TELEGRAM_ADMIN_IDS || "").split(",")), routeParser: new AdminRouteParser(), routeHandler, stateStore, botClient, logger: this.logger });
  }
  #resolveStoragePath(filePath) { return path.join(this.rootDirectory, filePath); }
}
