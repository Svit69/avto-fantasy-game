import { LimitedResponseBodyReader } from "./LimitedResponseBodyReader.js";
import { OperationalSettings as Settings } from "./OperationalSettings.js";

export class TelegramFileDownloader {
  async downloadFile(token, filePath) {
    const response = await fetch(`https://api.telegram.org/file/bot${token}/${filePath}`, { signal: AbortSignal.timeout(Settings.readNumber("TELEGRAM_DOWNLOAD_TIMEOUT_MS", 60000)) });
    if (!response.ok) throw new Error(`telegram_file_download_failed_${response.status}`);
    return new LimitedResponseBodyReader().readBuffer(response, Settings.readNumber("PROTOCOL_MAX_BYTES", 8000000));
  }
}
