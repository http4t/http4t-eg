import { HttpHandler, HttpRequest } from "@http4t/core/contract";
import { router } from "./router";
import { CumulativeLogger } from "./Logger";
import { logMiddleware } from "./LogMiddleware";

export class App implements HttpHandler {

  async handle(request: HttpRequest) {
    const cumulativeLogger = new CumulativeLogger();
    
    const cumulativeLogMiddleware = logMiddleware(cumulativeLogger);
    const appHandler = cumulativeLogMiddleware(router(cumulativeLogger));

    return appHandler.handle(request);
  };
}

