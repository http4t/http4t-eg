import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {response} from "@http4t/core/responses";
import {http} from "../App";
import {Logger} from "../Logger";
import {Middleware} from "../middleware";

export function handleError(log: Logger): Middleware<HttpHandler> {
  return (decorated: HttpHandler): HttpHandler => {
    return http(async (request: HttpRequest): Promise<HttpResponse> => {
      try {
        return await decorated.handle(request);
      } catch (e) {
        log.info(`${e}`);
        return response(500, JSON.stringify({message: e.message}));
      }
    })
  }
}