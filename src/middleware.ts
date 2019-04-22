import {HttpHandler} from "@http4t/core/contract";

export type Middleware<T> = (T) => T;
export type HttpMiddleware = Middleware<HttpHandler>;

export function middlewares<T>(...ms: Middleware<T>[]): Middleware<T> {
  return (handler: T): T => {
    return ms.reduce((handler, m) => m(handler), handler);
  }
}