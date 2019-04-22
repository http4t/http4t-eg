import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {HttpMiddleware} from "./middleware";
import {Logger} from "./Logger";

export function httpInfoLogger(logger: Logger): HttpMiddleware {
  return (handler: HttpHandler) => new HttpInfoLogger(handler, logger);
}

class HttpInfoLogger implements HttpHandler {
  constructor(private handler: HttpHandler, private logger: Logger) {
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    this.logger.info(`Received ${request.method} to ${request.uri.path}`);
    const response = await this.handler.handle(request);
    this.logger.info(`Responded ${response.status} \n`);
    this.logger.flush();
    return response;
  }

}