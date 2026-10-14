export class LimitedResponseBodyReader {
  async readBuffer(response, maximumBytes) {
    if (Number(response.headers.get("content-length") || 0) > maximumBytes) { await response.body?.cancel(); throw new Error("remote_file_too_large"); }
    const reader = response.body.getReader(); const chunks = []; let size = 0;
    try {
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > maximumBytes) { await reader.cancel(); throw new Error("remote_file_too_large"); }
        chunks.push(Buffer.from(value));
      }
      return Buffer.concat(chunks, size);
    } finally { reader.releaseLock(); }
  }
}
