import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { CumulativeLogger, Logger } from "./Logger";

export const logMiddleware = (handler: HttpHandler) => new LogMiddleware(handler);

export class LogMiddleware implements HttpHandler {
  constructor(private handler: HttpHandler, private logger: Logger = new CumulativeLogger()) {
  }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    this.logger.info(`Received ${request.method} to ${request.uri.path}`);
    const response = await this.handler.handle(request);
    this.logger.info(`Responded ${response.status} \n`);
    this.logger.flush();
    return response;
  }

}