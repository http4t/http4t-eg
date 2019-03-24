import { request } from "@http4t/core/requests";
import { HttpRequest } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";
import { expect } from "chai";
import { routes } from "./router";

describe('router', () => {

  it('handles with first route that matches path', async () => {
    const res = await routes(
      request('GET', '/foo'), async (_req: HttpRequest) => response(200, '/foo'),
      request('GET', '/foo/bar'), async (_req: HttpRequest) => response(200, '/foo/bar')
    )
      .handle(request('GET', '/foo'));

    expect(res.status).eq(200);
    expect(res.body).eq('/foo');
  });

  it('handles with first route that matches method and path', async () => {
    const res = await routes(
      request('GET', '/foo'), async (_req: HttpRequest) => response(200, 'GET'),
      request('POST', '/foo'), async (_req: HttpRequest) => response(200, 'POST')
    )
      .handle(request('POST', '/foo'));

    expect(res.status).eq(200);
    expect(res.body).eq('POST');
  });

  it('handles with first route that matches method, path and headers', async () => {
    const res = await routes(
      request('GET', '/foo', '', ['Content-Type', 'text/html']), async (_req: HttpRequest) => response(200, 'html'),
      request('GET', '/foo', '', ['Content-Type', 'application/json']), async (_req: HttpRequest) => response(200, 'json')
    )
      .handle(request('GET', '/foo', '', ['Content-Type', 'application/json']));

    expect(res.status).eq(200);
    expect(res.body).eq('json');
  });

  it('matches multiple headers', async () => {
    let res = await routes(
      request('GET', '/foo', '', ['Content-Type', 'application/json']), async (_req: HttpRequest) => response(200, 'json')
    )
      .handle(request('GET', '/foo', '', ['Content-Type', 'application/json'], ['Accept', 'application/json']));

    expect(res.status).eq(200);
    expect(res.body).eq('json');

    res = await routes(
      request('GET', '/foo', '', ['Content-Type', 'application/json'], ['Accept', 'text/html']), async (_req: HttpRequest) => response(200, 'html'),
      request('GET', '/foo', '', ['Content-Type', 'application/json'], ['Accept', 'application/json']), async (_req: HttpRequest) => response(200, 'json')
    )
      .handle(request('GET', '/foo', '', ['Content-Type', 'application/json'], ['Accept', 'application/json']));

    expect(res.status).eq(200);
    expect(res.body).eq('json');
  });

  it('404 if no match', async () => {
    const res = await routes(request('GET', '/foo'), async (req: HttpRequest) => response(200, req.body))
      .handle(request('GET', '/bar'));

    expect(res.status).eq(404);
  });

  it('throws when not given http request like object to match on', async () => {
    let error;
    try {
      await routes({}, () => {});
    } catch (e) {
      error = e;
    }
    expect(error.message).eq('Not a request like object to match on');
    error = undefined;

    try {
      await routes({uri: 'uri'}, () => {});
    } catch (e) {
      error = e;
    }

    expect(error.message).eq('Not a request like object to match on');
    error = undefined;

    try {
      await routes({uri: 'uri', method: 'GET'}, () => {});
    } catch (e) {
      error = e;
    }

    expect(error.message).eq('Not a request like object to match on');
    error = undefined;

    try {
      await routes({uri: 'uri', method: 'GET', headers: ['name', 'value']}, () => {});
    } catch (e) {
      error = e;
    }

    expect(error).eq(undefined)
  });

  it('throws when not given http handler fun to invoke', async () => {
    let error;

    try {
      await routes({uri: 'uri', method: 'GET', headers: ['name', 'value']});
    } catch (e) {
      error = e;
    }

    expect(error.message).eq('Not a handler to invoke');
    error = undefined;

    try {
      await routes(
        {uri: 'uri', method: 'GET', headers: ['name', 'value']}, () => {},
        {uri: 'uri', method: 'GET', headers: ['name', 'value']} /*no function*/
        );
    } catch (e) {
      error = e;
    }

    expect(error.message).eq('Not a handler to invoke');
    error = undefined;

    try {
      await routes(
        {uri: 'uri', method: 'GET', headers: ['name', 'value']}, () => {},
        {uri: 'uri', method: 'GET', headers: ['name', 'value']}, {} /*not a function but an object*/
        );
    } catch (e) {
      error = e;
    }

    expect(error.message).eq('Not a handler to invoke');
    error = undefined;
  });

});