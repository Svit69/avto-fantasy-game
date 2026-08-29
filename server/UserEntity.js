export class UserEntity {
  constructor(data) {
    this.id = String(data.id);
    this.name = data.name || "Менеджер";
    this.phone = data.phone || "";
    this.email = data.email || "";
    this.avatar = data.avatar || "";
    this.created_at = data.created_at || new Date().toISOString();
    this.status = data.status || "active";
  }

  mergeProfile(profile) {
    return new UserEntity({
      id: this.id,
      name: profile.name || this.name,
      phone: profile.phone || this.phone,
      email: profile.email || this.email,
      avatar: profile.avatar || this.avatar,
      created_at: this.created_at,
      status: profile.status || this.status,
    });
  }

  toJSON() {
    const { id, name, phone, email, avatar, created_at, status } = this;
    return { id, name, phone, email, avatar, created_at, status };
  }
}
