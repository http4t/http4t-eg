import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";

export type HttpHandlerFun = (req: HttpRequest) => Promise<HttpResponse>

export type Route = [HttpRequest, HttpHandlerFun];

export function routes(...allRoutes: (HttpRequest|HttpHandlerFun)[]): HttpHandler {
  return new Router(...allRoutes)
}

export class Router implements HttpHandler {
  private routes: Route[];

  constructor(...allRoutes: (HttpRequest|HttpHandlerFun)[]){
    this.routes = this.pairUpAndValidateRoutes(allRoutes);
  }

  public async handle(request: HttpRequest): Promise<HttpResponse> {
    const matchedRoute = this.matchRoute(this.routes, request);

    if (matchedRoute) return matchedRoute[1](request);
    return response(404, 'No routes matched')
  }

  matchRoute(routes, request: HttpRequest) {
    return routes.find((route) => {
      const matchingOnRequest: HttpRequest = route[0];
      const methodAndPathMatch = matchingOnRequest.method === request.method && request.uri.path.includes(matchingOnRequest.uri.path);
      if (matchingOnRequest.headers.length === 0) return methodAndPathMatch;

      return methodAndPathMatch && matchingOnRequest.headers.every(matchingHeader => {
        return request.headers.find(header => {
          return matchingHeader[0] === header[0] && matchingHeader[1] === header[1]
        }) !== undefined;
      })
    });
  }

   pairUpAndValidateRoutes(allRoutes: (HttpRequest | HttpHandlerFun)[]): Route[] {
    const routes: Route[] = [];

    let pair: Route = [] as any as Route;
    allRoutes.forEach((requestOrHandler, index) => {
      if (index % 2 == 0) pair.push(requestOrHandler);
      if (index % 2 == 1) {
        pair.push(requestOrHandler);
        routes.push(pair);
        pair = [] as any as Route;
      }
    });
    return routes;
  }

}
