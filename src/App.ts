import { HttpHandler, HttpRequest } from "@http4t/core/contract";
import { HttpRequestWithCaptures, routes } from "./router";
import { CumulativeLogger, Logger } from "./Logger";
import { httpInfoLogger } from "./HttpInfoLogger";
import { request } from "@http4t/core/requests";
import { response } from "@http4t/core/responses";
import { bufferText } from "@http4t/core/bodies";
import { Store } from "./Store";

export class App implements HttpHandler {

  constructor(private store: Store) {
  }

  async handle(request: HttpRequest) {
    const cumulativeLogger = new CumulativeLogger();
    const transaction = await this.store.getTransaction();
    const postgresStore = this.store;
    await postgresStore.migrate();

    const cumulativeLogMiddleware = httpInfoLogger(cumulativeLogger);
    const appHandler = cumulativeLogMiddleware(router(postgresStore, cumulativeLogger));

    return appHandler.handle(request);
  };

  async start() {
    await this.store.start();
  }

  async stop() {
    await this.store.stop();
  }
}

export const router = (store: Store, logger: Logger) => routes(
  [request('GET', '/probe/ready'), async () => {
    logger.info('probed ready');
    return response(200);
  }],
  [request('GET', '/probe/live'), async () => {
    logger.info('probed live');
    return response(200);
  }],
  [request('POST', '/store'), async (req: HttpRequestWithCaptures) => {
    logger.info('storing json');
    let body;
    try {
      body = JSON.parse(await bufferText(req.body));
    } catch (e) {
      return response(400, 'invalid json');
    }
    try {
      await store.save(body.id, body.document);
    } catch (e) {
      return response(400, 'unable to save document');
    }
    return response(201, body.id);
  }],
  [request('GET', '/store/{id:.*}'), async (req: HttpRequestWithCaptures) => {
    const captures = req.captures;
    const id = captures.id as string;
    const document = await store.get(id);
    logger.info(`retrieved json: "${JSON.stringify(document)}"`);

    return response(200, JSON.stringify(document))
  }]
);
