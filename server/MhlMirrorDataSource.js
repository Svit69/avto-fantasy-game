import { KhlMirrorDataSource } from "./KhlMirrorDataSource.js";
import { MhlMirrorCaptureDecoder } from "./MhlMirrorCaptureDecoder.js";

export class MhlMirrorDataSource extends KhlMirrorDataSource {
  constructor(fetcher = (...args) => fetch(...args), timeoutMs = 300000) {
    super(fetcher, timeoutMs, { endpoint: "mhl", createDecoder: () => new MhlMirrorCaptureDecoder() });
  }
}
