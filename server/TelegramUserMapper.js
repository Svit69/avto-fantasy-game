import { UserEntity } from "./UserEntity.js";

export class TelegramUserMapper {
  createUserFromTelegramProfile(profile, phone = "") {
    return new UserEntity({
      id: profile.id,
      name: this.#createManagerName(profile),
      phone,
      email: "",
      avatar: profile.photo_url || "",
      status: "active",
    });
  }

  createUserFromTelegramMessage(message) {
    const phone = message.contact?.phone_number || "";
    return this.createUserFromTelegramProfile(message.from || { id: message.contact.user_id }, phone);
  }

  #createManagerName(profile) {
    return [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || "Менеджер";
  }
}
