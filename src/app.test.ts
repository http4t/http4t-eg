import { App } from "./app";
import { ClientHandler, get, ServerHandler } from "http4t/contract/out/src";
import { expect } from "chai";

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