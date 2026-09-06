import { UserEntity } from "./UserEntity.js";
import { PostgresSingleKeyJsonRepository } from "./PostgresSingleKeyJsonRepository.js";

export class PostgresUserRepository {
  constructor(database) { this.records = new PostgresSingleKeyJsonRepository(database, "users"); }

  async upsertUser(user) {
    const current = await this.findUserById(user.id);
    const nextUser = current ? current.mergeProfile(user.toJSON()) : user;
    await this.records.upsertRecord(nextUser.id, nextUser.toJSON());
    return nextUser;
  }

  async findUserById(id) {
    const payload = await this.records.findRecord(id);
    return payload ? new UserEntity(payload) : null;
  }

  async listUsers() {
    return (await this.records.listRecords()).map((user) => new UserEntity(user));
  }
}
