import { HttpHandler, HttpRequest } from "@http4t/core/contract";
import { router } from "./router";
import { CumulativeLogger } from "./Logger";
import { httpInfoLogger } from "./HttpInfoLogger";

export class App implements HttpHandler {

  async handle(request: HttpRequest) {
    const cumulativeLogger = new CumulativeLogger();

    const cumulativeLogMiddleware = httpInfoLogger(cumulativeLogger);
    const appHandler = cumulativeLogMiddleware(router(cumulativeLogger));

    return appHandler.handle(request);
  };
}

