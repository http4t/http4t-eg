import { request } from "@http4t/core/requests";
import { HttpRequest } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";
import { expect } from "chai";
import { HttpRequestWithCaptures, routes } from "./router";
import { bufferText } from "@http4t/core/bodies";

describe('router', () => {

  it('handles with first route that matches path', async () => {
    const res = await routes(
      [request('GET', '/foo'), async (_req: HttpRequest) => response(200, '/foo')],
      [request('GET', '/foo/bar'), async (_req: HttpRequest) => response(200, '/foo/bar')]
    )
      .handle(request('GET', '/foo'));

    expect(res.status).eq(200);
    expect(res.body).eq('/foo');
  });

  it('handles with first route that matches method and path', async () => {
    const res = await routes(
      [request('GET', '/foo'), async (_req: HttpRequest) => response(200, 'GET')],
      [request('POST', '/foo'), async (_req: HttpRequest) => response(200, 'POST')]
    )
      .handle(request('POST', '/foo'));

    expect(res.status).eq(200);
    expect(res.body).eq('POST');
  });

  it('handles with first route that matches method, path and headers', async () => {
    const res = await routes(
      [request('GET', '/foo', '', ['Content-Type', 'text/html']), async (_req: HttpRequest) => response(200, 'html')],
      [request('GET', '/foo', '', ['Content-Type', 'application/json']), async (_req: HttpRequest) => response(200, 'json')]
    )
      .handle(request('GET', '/foo', '', ['Content-Type', 'application/json']));

    expect(res.status).eq(200);
    expect(res.body).eq('json');
  });

  it('matches multiple headers', async () => {
    let res = await routes(
      [request('GET', '/foo', '', ['Content-Type', 'application/json']), async (_req: HttpRequest) => response(200, 'json')]
    )
      .handle(request('GET', '/foo', '', ['Content-Type', 'application/json'], ['Accept', 'application/json']));

    expect(res.status).eq(200);
    expect(res.body).eq('json');

    res = await routes(
      [request('GET', '/foo', '', ['Content-Type', 'application/json'], ['Accept', 'text/html']), async (_req: HttpRequest) => response(200, 'html')],
      [request('GET', '/foo', '', ['Content-Type', 'application/json'], ['Accept', 'application/json']), async (_req: HttpRequest) => response(200, 'json')]
    )
      .handle(request('GET', '/foo', '', ['Content-Type', 'application/json'], ['Accept', 'application/json']));

    expect(res.status).eq(200);
    expect(res.body).eq('json');
  });

  it('exposes uri template capture', async () => {
    const res = await routes(
      [request('GET', '/{name}/path/{regex:\\d+}'), async (_req: HttpRequestWithCaptures) => {
        return response(200, JSON.stringify(_req.captures));
      }],
    )
      .handle(request('GET', '/tom/path/32145'));

    expect(res.status).eq(200);
    expect(JSON.parse(await bufferText(res.body))).eql({ name: 'tom', regex: '32145' });
  });

  it('404 if no match', async () => {
    const res = await routes([request('GET', '/foo'), async (req: HttpRequest) => response(200, req.body)])
      .handle(request('GET', '/bar'));

    expect(res.status).eq(404);
  });

});