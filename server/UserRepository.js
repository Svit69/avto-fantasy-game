import fs from "node:fs/promises";
import path from "node:path";
import { UserEntity } from "./UserEntity.js";

export class UserRepository {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async upsertUser(user) {
    const users = await this.#readUsers();
    const current = users.find((item) => item.id === user.id);
    const nextUser = current ? current.mergeProfile(user.toJSON()) : user;
    const nextUsers = users.filter((item) => item.id !== nextUser.id);
    nextUsers.push(nextUser);
    await this.#writeUsers(nextUsers);
    return nextUser;
  }

  async findUserById(id) {
    return (await this.#readUsers()).find((user) => user.id === String(id)) || null;
  }

  async #readUsers() {
    try {
      const payload = JSON.parse(await fs.readFile(this.filePath, "utf8"));
      return Array.isArray(payload.users) ? payload.users.map((user) => new UserEntity(user)) : [];
    } catch {
      return [];
    }
  }

  async #writeUsers(users) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify({ users }, null, 2), "utf8");
  }
}
