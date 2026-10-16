import assert from "node:assert/strict";
import { AdminPlayerVideoController } from "./AdminPlayerVideoController.js";
import { AdminPlayerVideoTestController } from "./AdminPlayerVideoTestController.js";
import { AdminConversationStateStore } from "./AdminConversationStateStore.js";
let player = { id: "p", firstName: "Михаил", lastName: "Гамзаков", team: "МХК Авто", status: "active" };
const repository = { listPlayers: async () => [player], findPlayerById: async (id) => id === "p" ? player : null,
  updatePlayerVideoNote: async (_id, videoNote) => { player = { ...player, videoNote }; return player; } };
const stateStore = new AdminConversationStateStore();
const roster = { slots: ["p", "a", "b", "c", "d", "e"].map((playerId) => ({ playerId })) };
const testController = new AdminPlayerVideoTestController({ playerCatalogRepository: repository,
  calendarRepository: { listCalendar: async () => ({ tours: [{ id: "future", month: "Ноябрь", deadlineAt: "2100-11-01" }] }) },
  rosterRepository: { findRosterByUserAndMonth: async () => roster } });
const controller = new AdminPlayerVideoController({ playerCatalogRepository: repository, stateStore, testController });
const route = (type, playerId = "p") => ({ chatId: 1, userId: 1, route: { type, playerId } });
assert((await controller.executeRoute(route("video_upload"))).text.includes("Гамзаков"));
let pending = stateStore.consumeState(1);
assert.equal(pending.type, "player_video_note");
await controller.handlePendingInput({ chatId: 1, userId: 1, pending });
assert(stateStore.consumeState(1), "Wrong input must keep the upload prompt active");
await controller.handlePendingInput({ chatId: 1, userId: 1, pending, videoNote: { file_id: "video", file_unique_id: "unique", duration: 20, length: 240 } });
assert.equal(player.videoNote.fileId, "video");
assert.equal((await controller.executeRoute(route("video_player"))).method, "sendVideoNote");
await controller.handlePendingInput({ chatId: 1, userId: 1, pending, videoNote: { file_id: "invalid", file_unique_id: "unique", duration: 61 } });
assert.equal(player.videoNote.fileId, "video", "Invalid replacement must preserve the old recording");
await controller.handlePendingInput({ chatId: 1, userId: 1, pending, videoNote: { file_id: "replacement", file_unique_id: "new", duration: 10 } });
const preview = await controller.executeRoute(route("video_test_tour", "future"));
assert.equal(preview.video_note, "replacement"); assert.equal(preview.chat_id, 1);
assert((await controller.executeRoute(route("video_test_menu"))).text.includes("пользователям ничего"));
assert((await controller.executeRoute(route("video_delete"))).text.includes("Удалить"));
assert(player.videoNote, "Delete needs a confirmation click");
assert((await controller.executeRoute(route("video_leave"))).text.includes("Убрать игрока из игры"));
await controller.executeRoute(route("video_remove")); assert.equal(player.videoNote, null);
assert((await controller.executeRoute({ ...route("video_upload"), chatId: -100 })).text.includes("личном чате"));
console.log("Player video upload, replace, delete and pre-deadline admin preview self-test passed");
