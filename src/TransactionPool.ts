import { Pool, PoolClient } from "pg";

export interface Transaction {
  query(command: string, parameters?: any[]): Promise<any>
}

export interface TransactionPool {
  start(): Promise<void>
  stop(): Promise<void>
  getTransaction(): Promise<Transaction>
}

class PostgresTransaction implements Transaction {
  constructor(private client: PoolClient) {
  }

  async query(command: string, parameters: (string | number | boolean)[]): Promise<any> {
    return this.client.query(command, parameters)
  }

}

export class PostgresTransactionPool implements TransactionPool {
  private client: PoolClient | undefined;

  constructor(private pool: Pool) {
  }

  public async start() {
    this.client = await this.pool.connect();
  }

  public async stop() {
    await this.client!.release();
    await this.pool.end();
  }

  public async getTransaction(): Promise<Transaction> {
    if (!this.client) throw new Error('Pool not started.');
    return new PostgresTransaction(this.client);
  }

}