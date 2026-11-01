import { VhlMatchReviewPolicy } from "./VhlMatchReviewPolicy.js";
import { VhlMatchReviewRepository } from "./VhlMatchReviewRepository.js";

export class VhlMatchReviewMessageFactory {
  constructor(repository = new VhlMatchReviewRepository(), policy = new VhlMatchReviewPolicy()) {
    Object.assign(this, { repository, policy });
  }
  async createReviewMessage(match, source, fallbackText) {
    const proposal = this.policy.createProposal(match, source);
    if (!proposal) return { text: fallbackText };
    const review = await this.repository.createReview(proposal);
    const pending = this.repository.isCurrent(review) && review.status === "pending";
    const text = `${fallbackText}\n\nДата и сторона Горняка совпали. Различается название соперника:\n` +
      `«${review.expectedName}» ↔ «${review.sourceName}»\nСходство написания: ${review.similarity}% (не доказательство совпадения).\n` +
      (review.similarity < 60 ? "Названия существенно различаются: нужна ручная проверка страницы ВХЛ.\n" : "Возможно сокращение или вариант написания названия.\n") +
      (pending ? "Проверьте соперника. Подтверждение разрешит сбор только этого матча; другие проверки сохранятся." : "Решение уже принято или запрос устарел.");
    const inline_keyboard = pending ? [[{ text: "Открыть страницу ВХЛ", url: `https://online.vhlru.ru/online/${match.onlineGameId}.html` }],
      [{ text: "Подтвердить и собрать", callback_data: `admin:vhl_online_review:${review.id}:yes` }],
      [{ text: "Отклонить", callback_data: `admin:vhl_online_review:${review.id}:no` }]] : [];
    return { text, id: review.id, status: this.repository.isCurrent(review) ? review.status : "expired", reply_markup: { inline_keyboard } };
  }
}
