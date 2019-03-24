import { App } from "./app";
import { expect } from "chai";
import { get } from "@http4t/core/requests";
import { ServerHandler } from "@http4t/node/server";
import { ClientHandler } from "@http4t/node/client";

describe('probe', () => {
  const serverHandler = new ServerHandler(new App());
  let baseUrl;

  before(async () => {
    baseUrl = `${await serverHandler.url()}`;
  });

  after(async () => {
    await serverHandler.close();
  });

  it('ready', async () => {
    const response = await new ClientHandler().handle(get(`${baseUrl}/probe/ready`));
    expect(response.status).eq(200);
  });

  it('live', async () => {
    const response = await new ClientHandler().handle(get(`${baseUrl}/probe/live`));
    expect(response.status).eq(200);
  });
});