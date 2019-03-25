import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";
import { Logger } from "./Logger";
import { request } from "@http4t/core/requests";

export type HttpHandlerFun = (req: HttpRequest) => Promise<HttpResponse>

export type Route = [HttpRequest, HttpHandlerFun];

export function routes(...requestsAndHandlers: any[]): HttpHandler {
  if (requestsAndHandlers.length % 2 === 1) throw new Error('Not a handler to invoke');
  const routes: Route[] = [];

  let pair: Route = [] as any as Route;
  requestsAndHandlers.forEach((requestOrHandler, index) => {
    if (index % 2 == 0) {
      if (typeof requestOrHandler !== 'object' || !(requestOrHandler.uri) || !(requestOrHandler.method) || !(requestOrHandler.headers)) {
        throw new Error('Not a request like object to match on');
      }
      pair.push(requestOrHandler);
    }
    if (index % 2 == 1) {
      if ((typeof requestOrHandler !== 'function')) {
        throw new Error('Not a handler to invoke');
      }
      pair.push(requestOrHandler);
      routes.push(pair);
      pair = [] as any as Route;
    }
  });

  return {
    handle: async (request: HttpRequest) => {
      const matchedRoute = routes.find((route) => {
        const matchingOnRequest: HttpRequest = route[0];
        const methodAndPathMatch = matchingOnRequest.method === request.method && request.uri.path.includes(matchingOnRequest.uri.path);
        if (matchingOnRequest.headers.length === 0) return methodAndPathMatch;

        return methodAndPathMatch && matchingOnRequest.headers.every(matchingHeader => {
          return request.headers.find(header => {
            return matchingHeader[0] === header[0] && matchingHeader[1] === header[1]
          }) !== undefined;
        })
      });

      if (matchedRoute) return matchedRoute[1](request);
      return response(404, 'No routes matched')
    }
  }
}

export const router = (logger: Logger) => routes(
  request('GET', '/probe/ready'), async () => {
    logger.info('probed ready');
    return response(200);
  },
  request('GET', '/probe/live'), async () => {
    logger.info('probed live');
    return response(200);
  },
);