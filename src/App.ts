import { HttpHandler, HttpRequest } from "@http4t/core/contract";
import { HttpRequestWithCaptures, routes } from "./router";
import { CumulativeLogger, Logger } from "./Logger";
import { httpInfoLogger } from "./HttpInfoLogger";
import { request } from "@http4t/core/requests";
import { response } from "@http4t/core/responses";

export class App implements HttpHandler {

  async handle(request: HttpRequest) {
    const cumulativeLogger = new CumulativeLogger();

    const cumulativeLogMiddleware = httpInfoLogger(cumulativeLogger);
    const appHandler = cumulativeLogMiddleware(router(cumulativeLogger));

    return appHandler.handle(request);
  };
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
  request('POST', '/store/table'), async () => {
    logger.info('storing json');
    return response(201, 'id');
  },
  request('GET', '/store/{table}/{id:.*}'), async (req: HttpRequestWithCaptures) => {
    logger.info('retrieving json');
    console.log(req.captures);
    return response(200, JSON.stringify({ name: 'Tom' }))
  }
);
