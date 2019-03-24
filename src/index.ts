import { ServerHandler } from "@http4t/node/server";
import { App } from "./app";

(async function main() {
  const app = new App();
  const server = new ServerHandler(app);
  console.log('Running on port', (await server.url()).authority);
})();