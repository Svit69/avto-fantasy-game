export class TelegramDocumentFileDownloader {
  constructor(botClient) { this.botClient = botClient; }

  async downloadDocument(document) {
    const file = await this.botClient.callJson("getFile", { file_id: document.file_id });
    if (!file?.result?.file_path) throw new Error("telegram_file_path_missing");
    return this.botClient.downloadFile(file.result.file_path);
  }
}
