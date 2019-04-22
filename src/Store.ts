import { Transaction, TransactionPool } from "./TransactionPool";

export interface Store {
  get(id: string): any;
  save(id: string, document: object): Promise<any>;
  getTransaction(): Promise<Transaction>;
  migrate(): Promise<any>
}

export class PostgresStore implements Store {
  private transaction?: Transaction;

  constructor(private transactionPool: TransactionPool) {
  }

  public async save(id: string, document: object): Promise<void> {
    if (!this.transaction) throw new Error('No transaction.');
    await this.transaction.query('INSERT INTO store values($1, $2) returning *', [id, document]);
  }

  public async get(id: string): Promise<any> {
    if (!this.transaction) throw new Error('No transaction.');
    const query = await this.transaction.query('SELECT * FROM store t WHERE t.id = $1', [id]);
    return query.rows[0];
  }

  public async getTransaction(): Promise<Transaction> {
    return this.transactionPool.getTransaction();
  }

  public async migrate() {
    if (!this.transaction) throw new Error('No transaction.');
    this.transaction.query('CREATE TABLE IF NOT EXISTS store (id varchar(64) primary key, document jsonb)');
  }
}