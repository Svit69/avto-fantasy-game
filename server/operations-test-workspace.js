import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export async function createOperationsTestWorkspace() {
  const prefix = path.join(os.tmpdir(), "avto-capacity-test-");
  const directory = await fs.mkdtemp(prefix);
  return { directory, close: async () => {
    if (!path.resolve(directory).startsWith(path.resolve(prefix))) throw new Error("unsafe_test_cleanup_path");
    await fs.rm(directory, { recursive: true, force: true });
  } };
}
