import { App, PostgresTransactionPool } from "./app";
import { expect } from "chai";
import { get } from "@http4t/core/requests";
import { ServerHandler } from "@http4t/node/server";
import { ClientHandler } from "@http4t/node/client";
import { Pool } from "pg";

describe('probe', () => {
  const app = new App(new PostgresTransactionPool(new Pool({})));
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

  it('ready', async () => {
    const response = await new ClientHandler().handle(get(`${baseUrl}probe/ready`));
    expect(response.status).eq(200);
  });

  it('live', async () => {
    const response = await new ClientHandler().handle(get(`${baseUrl}probe/live`));
    expect(response.status).eq(200);
  });
});