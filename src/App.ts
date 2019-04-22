import {HttpHandler, HttpRequest, HttpResponse} from "@http4t/core/contract";
import {httpInfoLogger} from "./HttpInfoLogger";
import {CumulativeLogger} from "./Logger";
import {middlewares} from "./middleware";
import {handleError} from "./middleware/errors";
import {inTransaction} from "./middleware/transaction";
import {router} from "./routes";
import {PostgresStore} from "./Store";
import {TransactionPool} from "./TransactionPool";


export function http(handle: (r: HttpRequest) => Promise<HttpResponse>): HttpHandler {
  return {handle};
}

async function migrateDb(transactionPool: TransactionPool): Promise<void> {
  const transaction = await transactionPool.getTransaction();
  if (!transaction) throw new Error('No transaction.');
  try {
    await transaction.query('BEGIN');
    await transaction.query('CREATE TABLE IF NOT EXISTS store (id varchar(64) primary key, document jsonb)');
    await transaction.query('COMMIT');
  } catch (e) {
    await transaction.query('ROLLBACK');
    throw e;
  } finally {
    await transaction.release();
  }
}

export class App implements HttpHandler {

  constructor(private transactionPool: TransactionPool) {
  }

  async handle(request: HttpRequest) {
    const transaction = await this.transactionPool.getTransaction();
    const store = new PostgresStore(transaction);
    const logger = new CumulativeLogger();

    const middleware = middlewares(
      inTransaction(transaction),
      httpInfoLogger(logger),
      handleError(logger));

    const handler = middleware(router(store, logger));
    return handler.handle(request);
  };

  async start() {
    await migrateDb(this.transactionPool);
  }

  async stop() {
    await this.transactionPool.stop();
  }
}

