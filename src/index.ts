import { ServerHandler } from "@http4t/node/server";
import { App} from "./app";
import { Pool } from "pg";
import { PostgresTransactionPool } from "./TransactionPool";
import { PostgresStore } from "./Store";

(async function main() {
  const postgresTransactionPool = new PostgresTransactionPool(new Pool({}));
  const app = new App(new PostgresStore(postgresTransactionPool));
  await app.start();
  const server = new ServerHandler(app);
  console.log('Running on port', (await server.url()).authority);
})();