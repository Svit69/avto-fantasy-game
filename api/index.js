import path from "node:path";
import { fileURLToPath } from "node:url";
import { EnvironmentFileLoader } from "../server/EnvironmentFileLoader.js";
import { ServerApplicationFactory } from "../server/ServerApplicationFactory.js";
import { ServerLogger } from "../server/ServerLogger.js";

class VercelServerlessApplication {
  constructor(rootDirectory, logger = new ServerLogger()) {
    new EnvironmentFileLoader().loadEnvironmentFile(path.join(rootDirectory, ".env"));
    this.application = new ServerApplicationFactory(rootDirectory, logger).createApplication();
  }

  handleHttpRequest(request, response) {
    return this.application.handleRequest(request, response);
  }
}

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverlessApplication = new VercelServerlessApplication(rootDirectory);

export default function handleVercelRequest(request, response) {
  return serverlessApplication.handleHttpRequest(request, response);
}
