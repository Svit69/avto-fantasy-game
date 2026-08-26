import { AppController } from "./controllers/AppController.js";

const rootElement = document.querySelector("#app");
const appController = new AppController(rootElement);

appController.initializeApplication();
