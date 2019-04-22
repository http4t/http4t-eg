import { App} from "./app";
import { expect } from "chai";
import { get, post } from "@http4t/core/requests";
import { ServerHandler } from "@http4t/node/server";
import { ClientHandler } from "@http4t/node/client";
import { bufferText } from "@http4t/core/bodies";
import { Pool } from "pg";
import { PostgresTransactionPool } from "./TransactionPool";
import { PostgresStore } from "./Store";

describe('store', function() {
  this.timeout(2000);

  const postgresTransactionPool = new PostgresTransactionPool(new Pool({}));
  const app = new App(new PostgresStore(postgresTransactionPool));
  const serverHandler = new ServerHandler(app);
  let baseUrl;

  before(async () => {
    await app.start();
    baseUrl = `${await serverHandler.url()}`;
  });

  after(async () => {
    await app.stop();
    await serverHandler.close();
  });

  it('stores some json', async () => {
    const client = new ClientHandler();
    const id = 'id' + (Math.random()*10000).toString().slice(0, 3);
    const body = JSON.stringify({ id: id, document: { name: 'Tom' } });

    const create = await client.handle(post(`${baseUrl}store`, body));
    const returnedId = await bufferText(create.body);
    expect(returnedId).eq(id);

    const retrieve = await client.handle(get(`${baseUrl}store/${returnedId}`));
    expect(await bufferText(retrieve.body)).eq(body)
  });
});