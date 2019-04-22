import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {http} from "../App";
import {Middleware} from "../middleware";
import {Transaction} from "../TransactionPool";

export function inTransaction(transaction: Transaction): Middleware<HttpHandler> {
  return (decorated: HttpHandler): HttpHandler => {
    return http(async (request: HttpRequest): Promise<HttpResponse> => {
      await transaction.query('BEGIN');
      try {
        const response = await decorated.handle(request);
        await transaction.query('COMMIT');
        return response;
      } catch (e) {
        await transaction.query('ROLLBACK');
        throw e;
      } finally {
        await transaction.release();
      }
    })
  }
}