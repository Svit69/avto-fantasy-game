export class TelegramBotMessageClassifier {
  isStartCommand(text = "") {
    return /^\/start(?:@\w+)?(?:\s|$)/.test(text.trim());
  }

  isScoringGuideRequest(text = "") {
    return text.trim().toLowerCase() === "как считаются очки";
  }
}
