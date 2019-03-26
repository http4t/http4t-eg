import { App } from "./app";
import { expect } from "chai";
import { get, post } from "@http4t/core/requests";
import { ServerHandler } from "@http4t/node/server";
import { ClientHandler } from "@http4t/node/client";
import { bufferText } from "@http4t/core/bodies";

describe('store', () => {
  const serverHandler = new ServerHandler(new App());
  let baseUrl;

  before(async () => {
    baseUrl = `${await serverHandler.url()}`;
  });

  after(async () => {
    await serverHandler.close();
  });

  it('stores some json', async () => {
    const client = new ClientHandler();
    const body = JSON.stringify({ name: 'Tom' });

    const create = await client.handle(post(`${baseUrl}store/table`, body));
    expect(create.status).eq(201);

    const id = await bufferText(create.body);
    expect(id).eq('id');

    const retrieve = await client.handle(get(`${baseUrl}store/table/${id}`));
    expect(await bufferText(retrieve.body)).eq(body)
  });
});