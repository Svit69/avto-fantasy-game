import assert from "node:assert/strict";
import { INITIAL_PLAYERS } from "../src/data/players.js";
import { AdminPlayerDirectory } from "./AdminPlayerDirectory.js";
import { AdminPlayerDirectoryView } from "./AdminPlayerDirectoryView.js";
import { AdminPlayerVideoView } from "./AdminPlayerVideoView.js";
import { AdminKeyboardFactory } from "./AdminKeyboardFactory.js";
const directory = new AdminPlayerDirectory(); const view = new AdminPlayerDirectoryView();
const teams = directory.listTeams(INITIAL_PLAYERS);
assert(teams.length >= 3);
const messages = [view.renderTeams(1, INITIAL_PLAYERS)];
for (const team of teams) {
  messages.push(view.renderPositions(1, INITIAL_PLAYERS, team.code));
  for (const position of Object.keys(directory.positions)) {
    const selected = directory.selectPlayers(INITIAL_PLAYERS, team.code, position);
    assert(selected.every((player) => player.team === team.name));
    assert(selected.every((player) => position === "all" || player.position === directory.positions[position]));
    for (let page = 0; page <= Math.ceil(selected.length / 9); page++) messages.push(view.renderPlayers(1, INITIAL_PLAYERS, team.code, `${position}:${page}`));
  }
}
const videoView = new AdminPlayerVideoView();
const recorded = INITIAL_PLAYERS.map((player) => ({ ...player, videoNote: { fileId: "file" } }));
messages.push(videoView.renderRecordings(1, recorded, 0), videoView.renderRecordings(1, recorded, 2));
for (const player of recorded) messages.push(videoView.renderPlayer(1, player), videoView.renderUploadPrompt(1, player), videoView.renderConfirmation(1, player, "delete"));
for (const message of messages) for (const button of message.reply_markup.inline_keyboard.flat()) {
  assert(Buffer.byteLength(button.callback_data, "utf8") <= 64, button.callback_data);
}
const page = view.renderPlayers(1, INITIAL_PLAYERS, teams[0].code, "all:99999");
assert(page.reply_markup.inline_keyboard.some((row) => row.some((button) => button.callback_data.startsWith("admin:player:"))));
assert(new AdminKeyboardFactory().createMenuKeyboard().flat().some((button) => button.callback_data === "admin:video_list:0"));
console.log("Player team/position directory, pagination and Telegram callback size self-test passed");
