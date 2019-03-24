import { HttpHandler, HttpRequest, HttpResponse } from "@http4t/core/contract";
import { response } from "@http4t/core/responses";

export class App implements HttpHandler {
  async handle(request: HttpRequest) {
    if (request.uri.path.includes('/probe/ready')) return response(200);
    if (request.uri.path.includes('/probe/live')) return response(200);

    return response(200, 'Hello, world!');
  };
}
