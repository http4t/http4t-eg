import { bufferText } from "@http4t/core/bodies";
import { request } from "@http4t/core/requests";
import { response } from "@http4t/core/responses";
import { Logger } from "./Logger";
import { HttpRequestWithCaptures, routes } from "./router";
import { Store } from "./Store";

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
    if (!document)
      return response(404);

    logger.info(`retrieved json: "${JSON.stringify(document)}"`);

    return response(200, JSON.stringify(document))
  }],
  [request('POST', '/test/store-then-throw'), async (req) => {
    logger.info('throwing an exception');
    const text = await bufferText(req.body);
    const body = JSON.parse(text);
    await store.save(body.id, body.document);
    // Transaction should roll back
    throw new Error("Deliberate error");
  }]
);