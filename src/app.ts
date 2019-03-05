import { HttpHandler, HttpRequest, response, ServerHandler } from "http4t/contract/out/src";

export class App implements HttpHandler {
  async handle(request: HttpRequest) {
    if (request.uri.path.includes('/probe/ready')) return response(200);
    if (request.uri.path.includes('/probe/live')) return response(200);

    return response(200, 'Hello, world!');
  };
}

(async function main() {
  const app = new App();
  const server = new ServerHandler(app);
  console.log('Running on port', (await server.url()).authority);
})();