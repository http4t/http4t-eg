import { ServerHandler } from "@http4t/node/server";
import { App, PostgresTransactionPool } from "./app";
import { Pool } from "pg";

(async function main() {
  const app = new App(new PostgresTransactionPool(new Pool({})));
  await app.start();
  const server = new ServerHandler(app);
  console.log('Running on port', (await server.url()).authority);
})();